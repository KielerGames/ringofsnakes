package game;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import game.ai.Bot;
import game.ai.StupidBot;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.Collidable;
import game.world.World;
import game.world.WorldChunk;
import server.Client;
import server.Player;
import server.protocol.Leaderboard;
import server.protocol.SnakeDeathInfo;
import server.protocol.SpawnInfo;
import util.ExceptionalExecutorService;

import javax.websocket.Session;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static util.TaskMeasurer.measure;

public class Game {
    private static final Gson gson = new Gson();
    private static final Gson prettyGson = new GsonBuilder().setPrettyPrinting().create();
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    public final CollisionManager collisionManager;
    public final List<Snake> snakes = new LinkedList<>();
    protected final ExceptionalExecutorService executor;
    private final Map<String, Client> clients = new HashMap<>(64);
    private final List<Bot> bots = new LinkedList<>();
    private byte ticksSinceLastUpdate = 0;
    private final Set<String> usedNames = new HashSet<>();

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
        executor.onExceptionDo((exception) -> {
            exception.printStackTrace();
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

            if (!snake.isAlive()) {
                // some snakes, such as the BoundarySnake are not killable
                final var killMessage = gson.toJson(new SnakeDeathInfo(snake));
                executor.schedule(() -> clients.forEach((sId, client) -> client.send(killMessage)), 0, TimeUnit.MILLISECONDS);
            }
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
            synchronized (clients) {
                clients.put(session.getId(), player);
            }
            player.sendSync(gson.toJson(new SpawnInfo(config, snake)));
            System.out.println("Player " + player.getName() + " has joined game");
            return player;
        });
    }

    private void addBotsRandomly(int n) {
        for (int i = 0; i < n; i++) {
            StupidBot bot = new StupidBot(this, this.world.findSpawnPosition());
            snakes.add(bot.getSnake());
            bots.add(bot);
        }
    }

    public void removeClient(String sessionId) {
        final Client client;

        synchronized (clients) {
            client = clients.remove(sessionId);
        }

        if (client instanceof Player) {
            final var snake = ((Player) client).snake;
            snake.kill();
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
            final var topTenJson = gson.toJson(new Leaderboard(this, 10));
            clients.forEach((__, client) -> client.send(topTenJson));
        }, 1, 1, TimeUnit.SECONDS);

        // spawn bots every 20 seconds
        executor.scheduleAtFixedRate(() -> {
            final var n = snakes.stream().filter(Snake::isAlive).count();

            if (n < config.targetSnakePopulation) {
                addBotsRandomly((int) Math.min(5, config.targetSnakePopulation - n));
            }
        }, 1, 16, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + prettyGson.toJson(config));
        System.out.println("Waiting for players to connect...");
    }

    /**
     * Run a method for each snake that is alive.
     */
    private void forEachSnake(Consumer<Snake> snakeConsumer) {
        snakes.stream().filter(Snake::isAlive).forEach(snakeConsumer);
    }

    protected void tick() {
        forEachSnake(snake -> {
            if (snake.isAlive()) {
                snake.tick();
                killDesertingSnakes(snake);
            }
        });
        bots.stream().filter(Bot::isAlive).forEach(Bot::act);
        eatFood();
        world.getHeatMap().update();
        collisionManager.detectCollisions();
        ticksSinceLastUpdate++;
    }

    private void updateClients() {
        synchronized (clients) {
            clients.forEach((__, client) -> {
                final var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
                worldChunks.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(client::updateClientSnakeChunk);
                worldChunks.forEach(client::updateClientFoodChunk);
                client.updateHeatMap(world.getHeatMap());
                client.sendUpdate(ticksSinceLastUpdate);
                client.cleanupKnowledge();
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
                    .collect(Collectors.toList());

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

    private void killDesertingSnakes(Snake s) {
        if (!world.box.isWithinSubBox(s.getHeadPosition(), 0.5 * s.getWidth())) {
            System.out.println("Removing Snake " + s.id + " from Game, because it is leaving the map.");
            s.kill();
        }
    }

    public void stop() {
        this.executor.shutdown();
    }

    public Stream<Client> streamClients() {
        return clients.values().stream();
    }
}
