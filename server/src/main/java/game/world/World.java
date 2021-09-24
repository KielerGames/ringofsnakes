package game.world;

import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import math.Vector;

import java.util.Comparator;
import java.util.Random;
import java.util.stream.Collectors;

public class World {
    private static final int FOOD_THRESHOLD = 16;
    public final WorldChunkCollection chunks;
    public double height;
    public double width;

    public World(double chunkSize, int repetitions) {
        chunks = WorldChunkFactory.createChunks(chunkSize, repetitions, repetitions);
        height = chunkSize * repetitions;
        width = chunkSize * repetitions;
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        chunks = WorldChunkFactory.createChunks(config.chunkInfo);
        height = config.chunkInfo.chunkSize * config.chunkInfo.rows;
        width = config.chunkInfo.chunkSize * config.chunkInfo.columns;
    }

    public Vector findSpawnPosition(Random rnd) {
        var worldChunkToSpawnIn = findRandomWorldChunkWithMinSnakeChunkCount(rnd);
        return worldChunkToSpawnIn.findSnakeSpawnPosition(rnd);
    }

    private WorldChunk findRandomWorldChunkWithMinSnakeChunkCount(Random rnd) {
        assert (chunks.numberOfChunks() > 0);
        var worldChunksSortedBySnakeChunkCount =
                chunks.stream().sorted(Comparator.comparing(WorldChunk::getSnakeChunkCount)).collect(Collectors.toList());
        var minimalSnakeChunkCount = worldChunksSortedBySnakeChunkCount.get(0).getSnakeChunkCount();
        var worldChunksWithMinimalSnakeChunkCount = worldChunksSortedBySnakeChunkCount.stream()
                .filter(worldChunk -> worldChunk.getSnakeChunkCount() == minimalSnakeChunkCount).collect(Collectors.toList());
        int randomIndex = rnd.nextInt(worldChunksWithMinimalSnakeChunkCount.size());
        return worldChunksSortedBySnakeChunkCount.get(randomIndex);
    }

    public void addSnake(Snake snake) {
        snake.chunks.forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunk snakeChunk) {
        chunks.findIntersectingChunks(snakeChunk.getBoundingBox())
                .forEach(chunk -> chunk.addSnakeChunk(snakeChunk));
    }

    public void spawnFood() {
        int numberOfChunksToSpawnSimultaneously = 8;

        chunks.stream()
                .filter(c -> c.getFoodCount() < FOOD_THRESHOLD)
                .sorted(Comparator.comparingInt(WorldChunk::getFoodCount))
                .limit(numberOfChunksToSpawnSimultaneously)
                .forEach(WorldChunk::addFood);
    }
}
