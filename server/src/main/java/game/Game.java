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
    public List<Snake> snakes = new LinkedList<>();
    private List<Bot> bots = new LinkedList<>();
    private final CollisionManager collisionManager;

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = new ExceptionalExecutorService();

        // spawn some food
        for (int i = 0; i < 42; i++) {
            world.spawnFood();
        }

        DebugView.setGame(this);
        collisionManager = new CollisionManager(this);
    }

    public Player createPlayer(Session session) {
        var spawnPos = world.findSpawnPosition();
        var snake = SnakeFactory.createSnake(spawnPos, world);
        snakes.add(snake);
        world.addSnake(snake);

        var player = new Player(snake, session);
        clients.put(session.getId(), player);
        var data = gson.toJson(new SpawnInfo(config, snake));
        player.sendSync(data);
        addBotsNextToPlayerOne(25.0, 2);
        return player;
    }

    public void addBotsNextToPlayerOne(Double radius, int n) {
        //adds n stupid bots next to the player at the start of the game
        Random random = new Random();
        if (!snakes.isEmpty()) {
            var position = snakes.get(0).getHeadPosition().clone();
            for (int i = 0; i < n; i++) {
                var spawnPosition = new Vector(position.x + (random.nextDouble() * 2 - 1.0) * radius,
                        position.y + (random.nextDouble() * 2 - 1.0) * radius);
                StupidBot bot = new StupidBot(this, spawnPosition);
                snakes.add(bot.getSnake());
                bots.add(bot);
                System.out.println("Bot added!");
            }
        }
    }

    public void removeClient(String sessionId) {
        var client = clients.remove(sessionId);
        if (client instanceof Player) {
            var snake = ((Player) client).snake;
            // TODO: generate food (?), consider changing list to another data structure
            snakes.remove(snake);
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
            if (!snakes.isEmpty()) {
                var snake = snakes.get(0);
                var worldChunk = world.chunks.findChunk(snake.getHeadPosition());
                System.out.println(worldChunk + ": amount of food: " + worldChunk.getFoodCount());
            }
        }, 0, 5, TimeUnit.SECONDS);

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
            world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            bots.forEach(Bot::act);
        }
        eatFood();
        collisionManager.manageCollisions();
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
            
            final var collectedFood = worldChunk.getFoodList().stream()
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
