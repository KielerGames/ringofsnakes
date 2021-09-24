package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.ai.Bot;
import game.ai.StupidBot;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.world.Food;
import game.world.World;
import game.world.WorldChunk;
import math.Vector;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;
import util.ExceptionalExecutorService;

import javax.websocket.Session;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class Game {
    private static final Gson gson = new Gson();
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    private final ExceptionalExecutorService executor;
    private final Map<String, Client> clients = new HashMap<>(64);
    private final CollisionManager collisionManager;
    public List<Snake> snakes = new LinkedList<>();
    private List<Bot> bots = new LinkedList<>();
    private Random rnd = new Random();

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = new ExceptionalExecutorService();

        // spawn some food
        for (int i = 0; i < 256; i++) {
            world.spawnFood();
        }

        DebugView.setGame(this);
        collisionManager = new CollisionManager(this);
    }

    public Player createPlayer(Session session) {
        final var spawnPos = world.findSpawnPosition(rnd);
        final Snake snake;

        synchronized (this) {
            snake = SnakeFactory.createSnake(spawnPos, world);
            snakes.add(snake);
        }

        final var player = new Player(snake, session);

        synchronized (this) {
            clients.put(session.getId(), player);
        }

        var data = gson.toJson(new SpawnInfo(config, snake));
        player.sendSync(data);

        executor.schedule(() -> {
            synchronized (this) {
                addBotsRandomly(25);
            }
        }, 1, TimeUnit.SECONDS);

        return player;
    }

    public void addBotsNextToPlayer(Player player, double radius, int n) {
        //adds n stupid bots next to the player at the start of the game
        Random random = new Random();

        final var position = player.snake.getHeadPosition();

        for (int i = 0; i < n; i++) {
            final var spawnPosition = new Vector(position.x + (random.nextDouble() * 2 - 1.0) * radius,
                    position.y + (random.nextDouble() * 2 - 1.0) * radius);
            StupidBot bot = new StupidBot(this, spawnPosition);
            snakes.add(bot.getSnake());
            bots.add(bot);
            System.out.println("Bot added next to player!");
        }
    }

    public void addBotsRandomly(int n) {
        for (int i = 0; i < n; i++) {
            StupidBot bot = new StupidBot(this, this.world.findSpawnPosition(rnd));
            snakes.add(bot.getSnake());
            bots.add(bot);
            System.out.println("Bot added randomly!");
        }
    }

    public void removeClient(String sessionId) {
        var client = clients.remove(sessionId);
        if (client instanceof Player) {
            var snake = ((Player) client).snake;
            // TODO: generate food (?), consider changing list to another data structure
            synchronized (this) {
                snakes.remove(snake);
            }
            snake.alive = false;
        }
    }

    public void start() {
        executor.scheduleAtFixedRate(() -> {
            tick();
            updateClients();
        }, 0, (long) (1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            synchronized (this) {
                world.spawnFood();
            }
        }, 100, (long) (25 * 1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            synchronized (this) {
                world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            }
        }, 250, 1000, TimeUnit.MILLISECONDS);

        System.out.println("Game started. Config:\n" + gson.toJson(config));


    }

    private void tick() {
        synchronized (this) {
            snakes.forEach(snake -> {
                if (snake.alive) {
                    snake.tick();
                    killDesertingSnakes(snake);
                }
            });
        }
        bots.forEach(Bot::act);
        synchronized (this) {
            eatFood();
            collisionManager.manageCollisions();
        }
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
        snakes.forEach(snake -> {
            final var foodCollectRadius = snake.getWidth() * 1.1 + 1.0;
            final var headPosition = snake.getHeadPosition();
            final var worldChunk = world.chunks.findChunk(headPosition);

            final var collectedFood = worldChunk.streamFood()
                    .filter(food -> food.isWithinRange(headPosition, foodCollectRadius))
                    .collect(Collectors.toList());

            final var foodAmount = collectedFood.stream()
                    .mapToDouble(food -> food.size.value)
                    .map(v -> v * v)
                    .sum();
            snake.grow((float) foodAmount * Food.nutritionalValue);

            synchronized (this) {
                worldChunk.removeFood(collectedFood);
            }
        });
    }

    private void killDesertingSnakes(Snake s) {
        if (Math.abs(s.getHeadPosition().x) > world.width / 2.0 - 3 || Math.abs(s.getHeadPosition().y) > world.height / 2.0 - 3) {
            System.out.println("Removing Snake " + s.id + " from Game, because it is leaving the map.");
            s.alive = false;
        }
    }
}
