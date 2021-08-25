package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.snake.Snake;
import game.world.Food;
import game.world.World;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
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

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = Executors.newSingleThreadScheduledExecutor();
        DebugView.setGame(this);
    }

    public Player createPlayer(Session session) {
        var spawnPos = world.findSpawnPosition();
        var snake = new Snake(spawnPos, world);
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
            snake.destroy();
        }
    }

    public void start() {
        executor.scheduleAtFixedRate(() -> {
            tick();

            clients.forEach((__, client) -> {
                //TODO: filter visible chunks
                snakes.forEach(snake ->
                        snake.chunks.forEach(client::updateChunk)
                );
                client.sendUpdate();
            });
        }, 0, (long) (1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            synchronized (this) {
                world.spawnFood();
            }
        }, 100, (long) (1000 * 25 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            if (!snakes.isEmpty()) {
                var snake = snakes.get(0);
                var worldChunk = world.chunks.findChunk(snake.getHeadPosition());
                synchronized (this) {
                    System.out.println(worldChunk + ": amount of food: " + worldChunk.getFoodCount());
                }
            }
        }, 0, 5, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }


    private void tick() {
        synchronized (this) {
            snakes.forEach(Snake::tick);
            //TODO: check collisions
        }

        eatFood();
    }

    private synchronized void eatFood() {
        snakes.forEach(snake -> {
            var headPosition = snake.getHeadPosition();
            var worldChunk = world.chunks.findChunk(headPosition);
            var foodList = worldChunk.getFoodList();
            var collectedFood = foodList.stream()
                    .filter(food -> food.isWithinRange(headPosition, 4.0))
                    .collect(Collectors.toList());
            snake.grow(collectedFood.size() * Food.nutritionalValue);
            worldChunk.removeFood(collectedFood);
        });
    }
}
