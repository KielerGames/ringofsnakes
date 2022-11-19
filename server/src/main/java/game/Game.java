package game;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import game.ai.Bot;
import game.ai.BotFactory;
import game.snake.*;
import game.world.Collidable;
import game.world.World;
import game.world.WorldChunk;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import server.SnakeServer;
import server.clients.Client;
import server.clients.Player;
import server.clients.Spectator;
import server.protocol.GameStatistics;
import server.protocol.SnakeDeathInfo;
import util.ExceptionalExecutorService;
import util.JSON;

import javax.annotation.Nullable;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(Game.class);
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    public final CollisionManager collisionManager;
    public final List<Snake> snakes = new LinkedList<>();
    protected final ExceptionalExecutorService executor;
    private final Map<Session, Client> clientsBySession = Collections.synchronizedMap(new HashMap<>(64));
    private final Multimap<Snake, Client> clientsBySnake = Multimaps.synchronizedMultimap(HashMultimap.create(64, 4));
    private final List<Bot> bots = new LinkedList<>();
    private final Set<String> usedNames = new HashSet<>();
    private byte ticksSinceLastUpdate = 0;

    public Game() {
        this(new GameConfig());

        final var boundarySnake = SnakeFactory.createBoundarySnake(world);
        snakes.add(boundarySnake);
    }

    /**
     * For tests only.
     */
    protected Game(GameConfig config) {
        this(new World(config));
    }

    protected Game(World world) {
        this.config = world.getConfig();
        this.world = world;
        executor = new ExceptionalExecutorService();
        executor.onExceptionOrErrorDo((throwable) -> {
            LOGGER.error("Critical error", throwable);
            System.exit(1);
        });
        collisionManager = new CollisionManager(this);
        collisionManager.onCollisionDo(this::onCollision);
    }

    private void onCollision(Snake snake, Collidable object) {
        if (object instanceof final SnakeChunk snakeChunk) {
            final var otherSnake = snakeChunk.getSnake();
            LOGGER.debug("{} collided with {}.", snake, otherSnake);
            snake.kill();

            if (snake.isAlive()) {
                // Some snakes, such as the BoundarySnake are not killable.
                return;
            }

            // update world and other snakes
            world.recycleDeadSnake(snake);
            otherSnake.addKill();

            handleSnakeDeath(snake, new SnakeDeathInfo(snake, otherSnake));
        }
    }

    private void handleSnakeDeath(Snake snake, SnakeDeathInfo info) {
        assert !snake.isAlive();
        final var spectatorTarget = info.killer instanceof BoundarySnake ? null : info.killer;

        // notify clients
        final var killMessage = JSON.stringify(info);
        executor.submit(() -> broadcast(killMessage));

        // transfer clients
        executor.submit(() -> {
            // Remove clients after broadcast
            final var clients = clientsBySnake.removeAll(snake);
            clients.forEach(client -> {
                clientsBySession.remove(client.session);

                if (client instanceof final Player player) {
                    final var spectator = Spectator.createFor(spectatorTarget, player);
                    registerSpectator(spectator, spectatorTarget);
                    SnakeServer.updateClient(spectator);
                } else if (client instanceof final Spectator spectator) {
                    spectator.setSnake(spectatorTarget);
                    registerSpectator(spectator, spectatorTarget);
                }
            });
        });
    }

    private void handleSnakeDeath(Snake snake) {
        handleSnakeDeath(snake, new SnakeDeathInfo(snake, null));
    }

    private void registerSpectator(Spectator spectator, @Nullable Snake targetSnake) {
        clientsBySession.put(spectator.session, spectator);
        if (targetSnake != null) {
            clientsBySnake.put(targetSnake, spectator);
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
            clientsBySession.put(session, player);
            clientsBySnake.put(snake, player);
            LOGGER.info("Player {} has joined game.", player.getName());
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
        final var client = clientsBySession.remove(session);

        if (client instanceof final Player player) {
            final var snake = player.getSnake();

            if (!snake.isAlive()) {
                return;
            }

            snake.kill();
            handleSnakeDeath(snake);
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

        LOGGER.info("Game started. Config:\n" + JSON.stringify(config, true));
        LOGGER.info("Waiting for players to connect...");
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
        clientsBySession.values().forEach(client -> {
            final var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
            worldChunks.stream()
                    .flatMap(WorldChunk::streamSnakeChunks)
                    .forEach(client::updateClientSnakeChunk);
            worldChunks.forEach(client::updateClientFoodChunk);
            client.updateHeatMap(world.getHeatMap());
            client.sendGameUpdate(ticksSinceLastUpdate);
        });
        ticksSinceLastUpdate = 0;
    }

    private void eatFood() {
        forEachSnake(snake -> {
            final var foodCollectRadius = snake.getWidth() * 1.1 + 0.32;
            final var headPosition = snake.getHeadPosition();
            final var worldChunk = world.chunks.findChunk(headPosition);

            // Consider food from worldChunk and its neighboring chunks
            final var mainFoodStream = worldChunk.streamFood();
            final var neighborChunkFoodStream = worldChunk.neighbors.stream()
                    .filter(chunk -> chunk.box.isWithinRange(headPosition, foodCollectRadius))
                    .flatMap(WorldChunk::streamFood);

            // Find food to be consumed by the snake.
            final var collectedFood = Stream.concat(mainFoodStream, neighborChunkFoodStream)
                    .filter(food -> food.isWithinRange(headPosition, foodCollectRadius))
                    .toList();

            if (collectedFood.isEmpty()) {
                return;
            }

            final var foodAmount = collectedFood.stream()
                    .mapToDouble(food -> food.size.area)
                    .sum() / Math.PI;

            // Consume food.
            snake.grow(foodAmount * config.foodNutritionalValue / snake.getWidth());
            worldChunk.removeFood(collectedFood);
        });
    }

    /**
     * Kill snakes leaving the map. This should be prevented by the boundary snake.
     * This is an extra safety layer to prevent corrupted server state.
     */
    private void killDesertingSnakes() {
        forEachSnake(snake -> {
            if (!world.box.isWithinSubBox(snake.getHeadPosition(), 0.5 * snake.getWidth())) {
                LOGGER.warn("Snake {} is out of bounds.", snake.id);
                snake.kill();

                if (!snake.isAlive()) {
                    handleSnakeDeath(snake);
                }
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

    /**
     * Send a (string) message to all clients.
     */
    private void broadcast(String encodedJsonData) {
        clientsBySession.values().forEach(client -> client.send(encodedJsonData));
    }
}
