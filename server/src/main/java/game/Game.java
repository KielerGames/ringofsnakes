package game;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import game.ai.Bot;
import game.ai.BotFactory;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.Collidable;
import game.world.World;
import game.world.WorldChunk;
import server.client.Client;
import server.client.Player;
import server.protocol.GameInfo;
import server.protocol.GameStatistics;
import server.protocol.SnakeDeathInfo;
import util.ExceptionalExecutorService;
import util.JSON;

import javax.websocket.Session;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static util.TaskMeasurer.measure;

public class Game {
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    public final CollisionManager collisionManager;
    public final List<Snake> snakes = new LinkedList<>();
    protected final ExceptionalExecutorService executor;
    private final Map<Session, Client> clientsBySession = new HashMap<>(64);
    private final Multimap<Snake, Client> clientsBySnake = HashMultimap.create(64, 4);
    private final List<Bot> bots = new LinkedList<>();
    private final Set<String> usedNames = new HashSet<>();
    private byte ticksSinceLastUpdate = 0;

    public Game() {
        this(new GameConfig());

        // spawn some food
        for (int i = 0; i < 256; i++) {
            world.spawnFood();
        }

        final var boundarySnake = SnakeFactory.createBoundarySnake(world);
        snakes.add(boundarySnake);
    }

    /**
     * For tests only.
     */
    protected Game(GameConfig config) {
        this(config, new World(config));
    }

    protected Game(GameConfig config, World world) {
        this.config = config;
        this.world = world;
        executor = new ExceptionalExecutorService();
        executor.onExceptionOrErrorDo((throwable) -> {
            throwable.printStackTrace();
            System.exit(1);
        });
        collisionManager = new CollisionManager(this);
        collisionManager.onCollisionDo(this::onCollision);
    }

    private void onCollision(Snake snake, Collidable object) {
        if (object instanceof final SnakeChunk snakeChunk) {
            final var otherSnake = snakeChunk.getSnake();
            System.out.println(snake + " collided with " + otherSnake + ".");
            snake.kill();

            if (snake.isAlive()) {
                // Some snakes, such as the BoundarySnake are not killable.
                return;
            }

            // update world and other snakes
            world.recycleDeadSnake(snake);
            otherSnake.addKill();

            // notify clients
            final var killMessage = JSON.stringify(new SnakeDeathInfo(snake, otherSnake));
            executor.submit(() -> clientsBySession.values().forEach(client -> client.send(killMessage)));
        }
    }

    public Future<Player> createPlayer(Session session) {
        final var spawnPos = world.findSpawnPosition();

        return CompletableFuture.supplyAsync(() -> {
            final String name;
            synchronized (usedNames) {
                name = SnakeNameGenerator.generateUnique(usedNames);
                usedNames.add(name);
            }

            final var snake = SnakeFactory.createSnake(spawnPos, world, name);
            snakes.add(snake);

            return snake;
        }, executor).thenApply(snake -> {
            final var player = new Player(snake, session);
            synchronized (clientsBySession) {
                clientsBySession.put(session, player);
            }
            synchronized (clientsBySnake) {
                clientsBySnake.put(snake, player);
            }
            player.sendSync(JSON.stringify(GameInfo.createForPlayer(snake)));
            System.out.println("Player " + player.getName() + " has joined game");
            return player;
        });
    }

    private void addBotsRandomly(int n) {
        for (int i = 0; i < n; i++) {
            final Bot bot = BotFactory.createBot(world);
            snakes.add(bot.getSnake());
            bots.add(bot);
        }
    }

    public void removeClient(Session session) {
        final Client client;

        synchronized (clientsBySession) {
            client = clientsBySession.remove(session);
        }

        if (client instanceof final Player player) {
            final var snake = player.getSnake();
            snake.kill();
            synchronized (clientsBySnake) {
                clientsBySnake.remove(snake, player);
            }
        }
    }

    public void start() {
        final long tickDuration = (long) (1000 * config.tickDuration);
        final long updateInterval = tickDuration;

        // run game ticks
        executor.scheduleAtFixedRate(measure("game-tick", this::tick), 0, tickDuration, TimeUnit.MILLISECONDS);

        // update clients
        executor.scheduleAtFixedRate(measure("client-update", this::updateClients), 10, updateInterval, TimeUnit.MILLISECONDS);

        // spawn food every second
        executor.scheduleAtFixedRate(world::spawnFood, 100, 1000, TimeUnit.MILLISECONDS);

        // garbage-collection every second
        executor.scheduleAtFixedRate(() -> {
            synchronized (usedNames) {
                snakes.stream()
                        .filter(Predicate.not(Snake::isAlive))
                        .map(s -> s.name)
                        .forEach(usedNames::remove);
            }
            snakes.removeIf(Predicate.not(Snake::isAlive));
            world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            bots.removeIf(Predicate.not(Bot::isAlive));
        }, 250, 1000, TimeUnit.MILLISECONDS);

        // update leaderboard every second
        executor.scheduleAtFixedRate(() -> {
            final var statsJson = JSON.stringify(new GameStatistics(this));
            broadcast(statsJson);
        }, 1, 2, TimeUnit.SECONDS);

        executor.scheduleAtFixedRate(
                () -> clientsBySession.values().forEach(Client::sendNameUpdate),
                420, 1500,
                TimeUnit.MILLISECONDS
        );

        // spawn bots every 8 seconds
        executor.scheduleAtFixedRate(() -> {
            final var n = snakes.stream().filter(Snake::isAlive).count();

            if (n < config.targetSnakePopulation) {
                addBotsRandomly((int) Math.min(6, config.targetSnakePopulation - n));
            }
        }, 1, 8, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + JSON.stringify(config, true));
        System.out.println("Waiting for players to connect...");
    }

    /**
     * Run a method for each snake that is alive.
     */
    private void forEachSnake(Consumer<Snake> snakeConsumer) {
        snakes.stream().filter(Snake::isAlive).forEach(snakeConsumer);
    }

    protected void tick() {
        forEachSnake(Snake::tick);
        bots.stream().filter(Bot::isAlive).forEach(Bot::act);
        killDesertingSnakes();
        eatFood();
        world.getHeatMap().update();
        collisionManager.detectCollisions();
        ticksSinceLastUpdate++;
    }

    private void updateClients() {
        synchronized (clientsBySession) {
            clientsBySession.values().forEach(client -> {
                final var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
                worldChunks.stream()
                        .flatMap(WorldChunk::streamSnakeChunks)
                        .forEach(client::updateClientSnakeChunk);
                worldChunks.forEach(client::updateClientFoodChunk);
                client.updateHeatMap(world.getHeatMap());
                client.sendGameUpdate(ticksSinceLastUpdate);
            });
        }
        ticksSinceLastUpdate = 0;
    }

    private void eatFood() {
        forEachSnake(snake -> {
            final var foodCollectRadius = snake.getWidth() * 1.1 + 1.0;
            final var headPosition = snake.getHeadPosition();
            final var worldChunk = world.chunks.findChunk(headPosition);

            final var collectedFood = worldChunk.streamFood()
                    .filter(food -> food.isWithinRange(headPosition, foodCollectRadius))
                    .toList();

            if (collectedFood.isEmpty()) {
                return;
            }

            final var foodAmount = collectedFood.stream()
                    .mapToDouble(food -> food.size.nutritionalValue)
                    .sum();
            snake.grow(foodAmount * config.foodNutritionalValue / snake.getWidth());
            worldChunk.removeFood(collectedFood);
        });
    }

    private void killDesertingSnakes() {
        forEachSnake(s -> {
            if (!world.box.isWithinSubBox(s.getHeadPosition(), 0.5 * s.getWidth())) {
                System.out.println("Snake " + s.id + " is out of bounds.");
                s.kill();
            }
        });
    }

    public void stop() {
        this.executor.shutdown();
    }

    public Stream<Client> streamClients() {
        return clientsBySession.values().stream();
    }

    public int getNumberOfBots() {
        return this.bots.size();
    }

    private void broadcast(String encodedJsonData) {
        synchronized (clientsBySession) {
            clientsBySession.values().forEach(client -> client.send(encodedJsonData));
        }
    }
}
