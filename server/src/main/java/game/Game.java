package game;

import com.google.gson.Gson;
import game.snake.Snake;
import game.world.World;
import math.Vector;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class Game {
    private static Gson gson = new Gson();
    public final int id = 1; //TODO
    public GameConfig config = new GameConfig();
    public List<Snake> snakes = new LinkedList<>();
    public World world = new World();
    private Map<String, Client> clients = new HashMap<>(64);
    private Thread tickerThread;

    public Player createPlayer(Session session) {
        var spawnPos = findSpawnPosition();
        var snake = new Snake(spawnPos.x, spawnPos.y);
        snakes.add(snake);

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
        if (tickerThread != null) {
            throw new IllegalStateException("Game tick thread already started.");
        }

        tickerThread = new Thread(new Ticker());
        tickerThread.start();

        System.out.println("Game started. Config:\n" + gson.toJson(config));
    }

    private Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    private void tick() {
        snakes.forEach(Snake::tick);

        //TODO: check collisions
    }

    private class Ticker implements Runnable {
        @Override
        public void run() {
            while (true) {
                tick();

                clients.forEach((__, client) -> {
                    //TODO: filter visible chunks
                    snakes.forEach(snake ->
                            snake.chunks.forEach(client::updateChunk)
                    );
                    client.sendUpdate();
                });

                // TODO: measure time and adapt
                sleep(config.tickDuration);
            }
        }

        private void sleep(double seconds) {
            int time = (int) Math.floor(1000 * seconds);
            try {
                Thread.sleep(time);
            } catch (InterruptedException ignored) {
            }
        }
    }
}
