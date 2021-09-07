package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.ai.StupidBot;
import game.ai.Bot;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.world.Food;
import game.world.World;
import game.world.WorldChunk;
import math.Vector;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;

import javax.websocket.Session;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class Game {
    private static final Gson gson = new Gson();
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    private final ScheduledExecutorService executor;
    private final Map<String, Client> clients = new HashMap<>(64);
    public List<Snake> snakes = new LinkedList<>();
    private List<Bot> bots = new LinkedList<>();

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = Executors.newSingleThreadScheduledExecutor();

        // spawn some food
        for (int i = 0; i < 42; i++) {
            world.spawnFood();
        }

        DebugView.setGame(this);
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
        addBotNextToPlayerOne(new Vector(3, 4));
        return player;
    }

    public void addBotNextToPlayerOne(Vector offset) {
        //add a basic bot next to the player at the start of the game
        if (!snakes.isEmpty()) {
            var position = snakes.get(0).getHeadPosition();
            position.x += offset.x;
            position.y += offset.y;
            StupidBot bot = new StupidBot(this, position);
            snakes.add(bot.getSnake());
            bots.add(bot);
            System.out.println("Bot added!");
        }
    }

    public void removeClient(String sessionId) {
        var client = clients.remove(sessionId);
        if (client instanceof Player) {
            var snake = ((Player) client).snake;
            // TODO: generate food (?), consider changing list to another data structure
            snakes.remove(snake);
            snake.destroy();
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
                System.out.println("pointDataLength" + snake.pointData.size());
            }
        }, 0, 5, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }


    private void tick() {
        synchronized (this) {
            snakes.forEach(Snake::tick);
            bots.forEach(Bot::act);
            checkForCollisions();
        }

        eatFood();
    }

    private void checkForCollisions() {
        snakes.forEach(s1 -> snakes.stream().filter(s2 -> s1.id != s2.id
                        && Vector.distance2(s1.getHeadPosition(), s2.getHeadPosition())
                        < s2.getLength() * s2.getLength())
                .anyMatch(s2 -> s1.collidesWith(s2)));
    }

    private void updateClients() {
        clients.forEach((id, client) -> {
            var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
            worldChunks.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(client::updateClientSnakeChunk);
            worldChunks.forEach(client::updateClientFoodChunk);

            client.sendUpdate();
        });
    }

    private void eatFood() {
        snakes.forEach(snake -> {
            var snakeWidth = snake.getWidth();
            var headPosition = snake.getHeadPosition();
            var worldChunk = world.chunks.findChunk(headPosition);
            var foodList = worldChunk.getFoodList();
            var collectedFood = foodList.stream()
                    .filter(food -> Vector.distance2(headPosition, food.position)
                            < (snakeWidth/2.0 + food.size.value)
                            * (snakeWidth/2.0 + food.size.value))
                    .collect(Collectors.toList());
            snake.grow(collectedFood.size() * Food.nutritionalValue);

            synchronized (this) {
                worldChunk.removeFood(collectedFood);
            }
        });
    }
}
