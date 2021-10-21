package game;

import com.google.gson.Gson;
import game.ai.Bot;
import game.ai.StupidBot;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.world.Collidable;
import game.world.World;
import game.world.WorldChunk;
import server.Client;
import server.Player;
import server.protocol.SnakeDeathInfo;
import server.protocol.SpawnInfo;
import util.ExceptionalExecutorService;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Game {
    private static final Gson gson = new Gson();
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    public final CollisionManager collisionManager;
    public final List<Snake> snakes = new LinkedList<>();
    private final ExceptionalExecutorService executor;
    private final Map<String, Client> clients = new HashMap<>(64);
    private final List<Bot> bots = new LinkedList<>();

    public Game() {
        this(new GameConfig());

        // spawn some food
        for (int i = 0; i < 256; i++) {
            world.spawnFood();
        }
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
        if (object instanceof SnakeChunk) {
            final var snakeChunk = (SnakeChunk) object;
            final var otherSnake = snakeChunk.getSnake();
            System.out.println("Snake " + snake.id + " collided with snake " + otherSnake.id + ".");
            snake.kill();

            final var killMessage = gson.toJson(new SnakeDeathInfo(snake));
            executor.schedule(() -> clients.forEach((sId, client) -> client.send(killMessage)), 0, TimeUnit.MILLISECONDS);
        }
    }

    public Future<Player> createPlayer(Session session) {
        final var spawnPos = world.findSpawnPosition();

        return CompletableFuture.supplyAsync(() -> {
            final var snake = SnakeFactory.createSnake(spawnPos, world);
            snakes.add(snake);
            return snake;
        }, executor).thenApply(snake -> {
            final var player = new Player(snake, session);
            synchronized (clients) {
                clients.put(session.getId(), player);
            }
            player.sendSync(gson.toJson(new SpawnInfo(config, snake)));
            return player;
        });
    }

    public void addBotsRandomly(int n) {
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
        executor.scheduleAtFixedRate(() -> {
            tick();
            updateClients();
        }, 0, (long) (1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(world::spawnFood, 100, (long) (25 * 1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            // garbage-collection
            snakes.removeIf(Predicate.not(Snake::isAlive));
            world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            bots.removeIf(Predicate.not(Bot::isAlive));
        }, 250, 1000, TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            final var n = snakes.stream().filter(Snake::isAlive).count();

            if (n < config.targetSnakePopulation) {
                addBotsRandomly((int) Math.min(4, config.targetSnakePopulation - n));
            }
        }, 1, 25, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }

    /**
     * Run a method for each snake that is alive.
     */
    private void forEachSnake(Consumer<Snake> snakeConsumer) {
        snakes.stream().filter(Snake::isAlive).forEach(snakeConsumer);
    }

    protected synchronized void tick() {
        forEachSnake(snake -> {
            if (snake.isAlive()) {
                snake.tick();
                killDesertingSnakes(snake);
            }
        });
        bots.stream().filter(Bot::isAlive).forEach(Bot::act);
        eatFood();
        collisionManager.detectCollisions();
    }

    private void updateClients() {
        clients.forEach((id, client) -> {
            final var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
            worldChunks.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(client::updateClientSnakeChunk);
            worldChunks.forEach(client::updateClientFoodChunk);
            client.sendUpdate();
            client.cleanupKnowledge();
        });
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
                    .mapToDouble(food -> food.size.value)
                    .map(v -> v * v)
                    .sum();
            snake.grow(foodAmount * config.foodNutritionalValue);

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
