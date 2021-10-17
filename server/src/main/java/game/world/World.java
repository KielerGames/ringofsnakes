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
    private static Random random = new Random();
    private final GameConfig config;

    public World(double chunkSize, int repetitions) {
        this.config = new GameConfig();
        chunks = WorldChunkFactory.createChunks(this, chunkSize, repetitions, repetitions);
        height = chunkSize * repetitions;
        width = chunkSize * repetitions;
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        this.config = config;
        chunks = WorldChunkFactory.createChunks(this);
        height = config.chunkInfo.chunkSize * config.chunkInfo.rows;
        width = config.chunkInfo.chunkSize * config.chunkInfo.columns;
    }

    public Vector findSpawnPosition() {
        var worldChunkToSpawnIn = findRandomWorldChunkWithMinSnakeChunkCount();
        return worldChunkToSpawnIn.findSnakeSpawnPosition(World.random);
    }

    private WorldChunk findRandomWorldChunkWithMinSnakeChunkCount() {
        assert (chunks.numberOfChunks() > 0);
        var minimalSnakeChunkCount = chunks.stream().mapToInt(WorldChunk::getSnakeChunkCount).min().orElseThrow();
        var worldChunksWithMinimalSnakeChunkCount = chunks.stream()
                .filter(worldChunk -> worldChunk.getSnakeChunkCount() == minimalSnakeChunkCount).collect(Collectors.toList());
        int randomIndex = World.random.nextInt(worldChunksWithMinimalSnakeChunkCount.size());
        return worldChunksWithMinimalSnakeChunkCount.get(randomIndex);
    }

    public void addSnake(Snake snake) {
        snake.streamSnakeChunks().forEach(this::addSnakeChunk);
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

    /**
     * Sets the random object, useful for debugging
     * and for deterministic tests
     *
     * @param random
     */
    public static void setRandom(Random random) {
        World.random = random;
    }

    public GameConfig getConfig() {
        return this.config;
    }
}
