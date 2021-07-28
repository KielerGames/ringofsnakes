package game.world;

import game.snake.Snake;
import game.snake.SnakeChunkData;
import math.Vector;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;

public class World {
    private static final int FOOD_THRESHOLD = 12;
    private final WorldChunk superChunk;
    private List<WorldChunk> smallChunks;

    public World() {
        superChunk = new WorldChunk(512.0, 512.0, 2);
        smallChunks = new LinkedList<>();
        superChunk.collectChildren(smallChunks);
    }

    public Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        superChunk.addSnakeChunk(snakeChunk);
    }

    public void spawnFood() {
        int numberOfChunksToSpawnSimultaneously = 1;

        smallChunks.stream()
                .filter(c -> c.getFoodCount() < FOOD_THRESHOLD)
                .sorted(Comparator.comparingInt(WorldChunk::getFoodCount))
                .limit(numberOfChunksToSpawnSimultaneously)
                .forEach(WorldChunk::addFood);
    }

}
