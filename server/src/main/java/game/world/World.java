package game.world;

import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import math.BoundingBox;
import math.Vector;

import java.util.Comparator;
import java.util.Random;
import java.util.stream.Collectors;

public class World {
    private static final int FOOD_THRESHOLD = 16;
    private static Random random = new Random();
    public final WorldChunkCollection chunks;
    private final GameConfig config;
    public BoundingBox box;
    public final Vector center = new Vector(0,0);

    public World(double chunkSize, int repetitions) {
        this.config = new GameConfig(new GameConfig.ChunkInfo(chunkSize, repetitions));
        chunks = WorldChunkFactory.createChunks(this);
        box = new BoundingBox(new Vector(0, 0), chunkSize * repetitions, chunkSize * repetitions);
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        this.config = config;
        chunks = WorldChunkFactory.createChunks(this);
        box = new BoundingBox(new Vector(0, 0), config.chunk.chunkSize * config.chunk.columns, config.chunk.chunkSize * config.chunk.rows);
    }

    /**
     * Sets the random object, useful for debugging
     * and for deterministic tests
     *
     * @param random The random instance to use
     */
    public static void setRandom(Random random) {
        World.random = random;
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

    public GameConfig getConfig() {
        return this.config;
    }
}
