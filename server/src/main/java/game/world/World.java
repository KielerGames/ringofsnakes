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
import java.util.concurrent.ThreadLocalRandom;

public class World {
    private static final int FOOD_THRESHOLD = 16;
    @Setter private static Random randomForTests;
    public final WorldChunkCollection chunks;
    public final Vector center = new Vector(0, 0);
    public final BoundingBox box;
    @Getter private final GameConfig config;
    @Getter private final HeatMap heatMap;

    public World(double chunkSize, int repetitions) {
        this(new GameConfig(new GameConfig.ChunkInfo(chunkSize, repetitions)));
    }

    public World() {
        this(32.0, 16);
    }

    public World(GameConfig config) {
        this.config = config;
        chunks = WorldChunkFactory.createChunks(this);
        box = new BoundingBox(new Vector(0, 0), config.chunks.size * config.chunks.columns, config.chunks.size * config.chunks.rows);
        heatMap = new HeatMap(config, chunks::stream);
        spawnInitialFood();
    }

    public Vector findSpawnPosition() {
        var worldChunkToSpawnIn = findRandomWorldChunkWithMinSnakeChunkCount();
        return worldChunkToSpawnIn.findSnakeSpawnPosition(getRandom());
    }

    private WorldChunk findRandomWorldChunkWithMinSnakeChunkCount() {
        assert (chunks.numberOfChunks() > 0);
        var minimalSnakeChunkCount = chunks.stream().mapToInt(WorldChunk::getSnakeChunkCount).min().orElseThrow();
        var worldChunksWithMinimalSnakeChunkCount = chunks.stream()
                .filter(worldChunk -> worldChunk.getSnakeChunkCount() == minimalSnakeChunkCount).toList();
        int randomIndex = getRandom().nextInt(worldChunksWithMinimalSnakeChunkCount.size());
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

    public void recycleDeadSnake(Snake snake) {
        final var random = getRandom();

        //TODO:
        // - consider spawning larger food items for larger snakes #120
        // - fine adjust food value per dead snake
        final var foodScattering = 1.0;
        final var caloricValueOfSnake = 0.64 * snake.getLength(); //TODO: adjust
        final var caloricValueOfFoodSpawn = Food.Size.MEDIUM.value * Food.Size.MEDIUM.value * config.foodNutritionalValue;
        final var numberOfFoodSpawns = (int) (caloricValueOfSnake / caloricValueOfFoodSpawn);
        final var lengthUntilFoodSpawn = snake.getLength() / Math.max(1, numberOfFoodSpawns);

        for (int i = 0; i < numberOfFoodSpawns; i++) {
            final var offset = i * lengthUntilFoodSpawn;
            final var spawnPosition = snake.getPositionAt(offset);
            if (spawnPosition == null) {
                // In some edge cases getPositionAt can return null.
                // This can be ignored because the number of spawned food items is not critical.
                continue;
            }
            spawnPosition.addScaled(new Vector(random.nextDouble(), random.nextDouble()), foodScattering);
            if (!box.isWithinSubBox(spawnPosition, 1.0)) {
                continue;
            }
            final var worldChunk = chunks.findChunk(spawnPosition);
            final var food = new Food(spawnPosition, worldChunk, Food.Size.MEDIUM, snake.getSkin());
            worldChunk.addFood(food);
        }
    }

    private void spawnInitialFood() {
        final int numChunks = config.chunks.rows * config.chunks.columns;
        final double area = numChunks * config.chunks.size * config.chunks.size;
        final int n = (int) (area / 900);

        for (int i = 0; i < n; i++) {
            spawnFood();
        }
    }

    private Random getRandom() {
        if (randomForTests != null) {
            return randomForTests;
        }

        return ThreadLocalRandom.current();
    }
}
