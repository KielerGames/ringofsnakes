package game.world;

import game.snake.Snake;
import game.snake.SnakeChunkData;
import math.Vector;

public class World {
    private WorldChunk superChunk = new WorldChunk(512.0, 512.0, 2);

    public Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        superChunk.addSnakeChunk(snakeChunk);
    }
}
