package game.world;

import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import math.Vector;

import java.util.Comparator;

public class World {
    private static final int FOOD_THRESHOLD = 50;
    public final WorldChunkCollection chunks;

    public World(double chunkSize, int repetitions) {
        chunks = WorldChunkFactory.createChunks(chunkSize, repetitions, repetitions);
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        chunks = WorldChunkFactory.createChunks(config.chunkInfo);
    }

    public Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunk snakeChunk) {
        chunks.findIntersectingChunks(snakeChunk.getBoundingBox())
                .forEach(chunk -> chunk.addSnakeChunk(snakeChunk));
    }

    public void spawnFood() {
        int numberOfChunksToSpawnSimultaneously = 12;

        chunks.stream()
                .filter(c -> c.getFoodCount() < FOOD_THRESHOLD)
                .sorted(Comparator.comparingInt(WorldChunk::getFoodCount))
                .limit(numberOfChunksToSpawnSimultaneously)
                .forEach(WorldChunk::addFood);
    }
}
