package game.world;

import game.snake.Snake;
import game.snake.SnakeChunkData;
import math.Vector;

import java.util.Comparator;

public class World {
    private static final int FOOD_THRESHOLD = 12;
    public final WorldChunkCollection chunks;

    public World() {
        chunks = WorldChunkFactory.createChunks(32.0, 16, 16);
    }

    public Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        chunks.findIntersectingChunks(snakeChunk.getBoundingBox())
                .forEach(chunk -> chunk.addSnakeChunk(snakeChunk));
    }

    public void spawnFood() {
        int numberOfChunksToSpawnSimultaneously = 16;

        chunks.stream()
                .filter(c -> c.getFoodCount() < FOOD_THRESHOLD)
                .sorted(Comparator.comparingInt(WorldChunk::getFoodCount))
                .limit(numberOfChunksToSpawnSimultaneously)
                .forEach(WorldChunk::addFood);
    }
}
