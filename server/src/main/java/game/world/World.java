package game.world;

import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import lombok.Getter;
import lombok.Setter;
import math.BoundingBox;
import math.Vector;

import java.util.Comparator;
import java.util.Random;

public class World {
    private static final int FOOD_THRESHOLD = 16;
    @Setter private static Random random = new Random();
    public final WorldChunkCollection chunks;
    public final Vector center = new Vector(0, 0);
    @Getter private final GameConfig config;
    @Getter private final HeatMap heatMap;
    public final BoundingBox box;

    public World(double chunkSize, int repetitions) {
        this.config = new GameConfig(new GameConfig.ChunkInfo(chunkSize, repetitions));
        chunks = WorldChunkFactory.createChunks(this);
        box = new BoundingBox(new Vector(0, 0), chunkSize * repetitions, chunkSize * repetitions);
        heatMap = new HeatMap(config, chunks::stream);
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        this.config = config;
        chunks = WorldChunkFactory.createChunks(this);
        box = new BoundingBox(new Vector(0, 0), config.chunks.size * config.chunks.columns, config.chunks.size * config.chunks.rows);
        heatMap = new HeatMap(config, chunks::stream);
    }

    public Vector findSpawnPosition() {
        var worldChunkToSpawnIn = findRandomWorldChunkWithMinSnakeChunkCount();
        return worldChunkToSpawnIn.findSnakeSpawnPosition(World.random);
    }

    private WorldChunk findRandomWorldChunkWithMinSnakeChunkCount() {
        assert (chunks.numberOfChunks() > 0);
        var minimalSnakeChunkCount = chunks.stream().mapToInt(WorldChunk::getSnakeChunkCount).min().orElseThrow();
        var worldChunksWithMinimalSnakeChunkCount = chunks.stream()
                .filter(worldChunk -> worldChunk.getSnakeChunkCount() == minimalSnakeChunkCount).toList();
        int randomIndex = World.random.nextInt(worldChunksWithMinimalSnakeChunkCount.size());
        return worldChunksWithMinimalSnakeChunkCount.get(randomIndex);
    }

    public void addSnake(Snake snake) {
        snake.streamSnakeChunks().forEach(this::addSnakeChunk);
    }

    public void addSnakeChunk(SnakeChunk snakeChunk) {
        // Snake width can change throughout the lifetime of a snake chunk.
        // To avoid updating world chunks later we assume maximum width here.
        chunks.findNearbyChunks(snakeChunk.getBoundingBox(), 0.5 * config.snakes.maxWidth)
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
