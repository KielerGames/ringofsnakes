package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.snake.Snake;
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
import java.util.concurrent.TimeUnit;

public class Game {
    private static final Gson gson = new Gson();

    public final int id = 1; //TODO

    public final GameConfig config;
    public final World world;
    private final Map<String, Client> clients = new HashMap<>(64);
    public List<Snake> snakes = new LinkedList<>();
    private Thread tickerThread;

    public Game() {
        config = new GameConfig();
        world = new World(config);
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
        if (tickerThread != null) {
            throw new IllegalStateException("Game tick thread already started.");
        }

        tickerThread = new Thread(new Ticker());
        tickerThread.start();

        new Thread(new DebugThread()).start();

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }


    private void tick() {
        synchronized (this) {
            snakes.forEach(Snake::tick);
            //TODO: check collisions
        }
    }

    private class Ticker implements Runnable {
        @Override
        public void run() {
            var executor = Executors.newSingleThreadScheduledExecutor();

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

            executor.scheduleAtFixedRate(world::spawnFood, 100, (long) (1000 * 5 * config.tickDuration), TimeUnit.MILLISECONDS);
        }
    }

    private class DebugThread implements Runnable {
        @Override
        public void run() {
            var executor = Executors.newSingleThreadScheduledExecutor();
            executor.scheduleAtFixedRate(() -> {
                if (!snakes.isEmpty()) {
                    var snake = snakes.get(0);
                    var worldChunk = world.chunks.findChunk(snake.getHeadPosition());
                    System.out.println(worldChunk + ": amount of food: " + worldChunk.getFoodCount());
                }
            }, 0, 1, TimeUnit.SECONDS);
        }
    }
}
