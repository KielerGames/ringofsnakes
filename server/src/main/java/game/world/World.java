package game.world;

import game.snake.Snake;
import game.snake.SnakeChunkData;
import math.BoundingBox;
import math.Vector;

import java.util.Comparator;
import java.util.List;

public class World {
    private static final int FOOD_THRESHOLD = 12;
    private final List<WorldChunk> chunks;

    public World() {
        chunks = WorldChunkFactory.createChunks(128.0, 8, 8);
    }

    public Vector findSpawnPosition() {
        return new Vector(0.0, 0.0); //TODO
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        // TODO: improve
        chunks.stream()
                .filter(chunk -> BoundingBox.intersect(chunk.box, snakeChunk.getBoundingBox()))
                .forEach(chunk -> chunk.addSnakeChunk(snakeChunk));
    }

    public void spawnFood() {
        int numberOfChunksToSpawnSimultaneously = 1;

        chunks.stream()
                .filter(c -> c.getFoodCount() < FOOD_THRESHOLD)
                .sorted(Comparator.comparingInt(WorldChunk::getFoodCount))
                .limit(numberOfChunksToSpawnSimultaneously)
                .forEach(WorldChunk::addFood);
    }
}
