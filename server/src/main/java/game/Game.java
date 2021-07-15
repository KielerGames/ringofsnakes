package game;

import game.snake.Snake;
import game.world.World;
import math.Vector;
import server.Client;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

public class Game {
    public int id;
    public GameConfig config = new GameConfig();
    public List<Snake> snakes = new LinkedList<>();
    private Set<Client> clients = new HashSet<>();
    public World world;
    private Thread tickerThread;

    public Snake addSnake() {
        var spawnPos = findSpawnPosition();
        Snake snake = new Snake(spawnPos.x, spawnPos.y);
        snakes.add(snake);
        return snake;
    }

    public void start() {
        if(tickerThread != null) {
            throw new IllegalStateException("Game tick thread already started.");
        }

        tickerThread = new Thread(new Ticker());
        tickerThread.start();
    }

    private Vector findSpawnPosition() {
        return new Vector(0.0,0.0); //TODO
    }

    private void tick() {
        snakes.forEach(Snake::tick);

        //TODO: check collisions
    }

    private class Ticker implements Runnable {
        @Override
        public void run() {
            while (snakes.size() > 0) {
                tick();

                clients.forEach(client -> {
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
