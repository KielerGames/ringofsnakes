package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.world.Food;
import game.world.World;
import game.world.WorldChunk;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;
import util.ExceptionalExecutorService;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
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

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = new ExceptionalExecutorService();

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

        return player;
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

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }


    private void tick() {
        synchronized (this) {
            snakes.forEach(Snake::tick);
            world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            //TODO: check collisions
        }

        eatFood();
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
}
