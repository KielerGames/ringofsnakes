package game;

import game.snake.Snake;
import game.world.World;
import math.Vector;

import java.util.LinkedList;
import java.util.List;

public class Game {
    public int id;
    public GameConfig config = new GameConfig();
    public List<Snake> snakes = new LinkedList<>();
    public World world;

    public Snake addSnake() {
        var spawnPos = findSpawnPosition();
        Snake snake = new Snake(spawnPos.x, spawnPos.y);
        snakes.add(snake);
        return snake;
    }

    private Vector findSpawnPosition() {
        return new Vector(0.0,0.0); //TODO
    }

    public void tick() {
        snakes.forEach(snake -> snake.tick());

        //TODO: check collisions
    }
}
