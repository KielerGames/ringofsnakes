package game.world;

import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import lombok.Getter;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Stream;

public class WorldChunk {
    public static final int FOOD_HEADER_SIZE = 4;
    public final BoundingBox box;
    public final List<WorldChunk> neighbors = new ArrayList<>(8);
    private final Set<SnakeChunk> snakeChunks = new HashSet<>();
    private @Getter final byte x, y;
    private final World world;
    private final List<Food> foodList = new LinkedList<>();
    /**
     * A map that stores the number of {@link SnakeChunk}s for each {@link Snake} in this chunk.
     */
    private final Map<Snake, Integer> snakes = new HashMap<>(6);
    /**
     * A readonly set view of the {@link #snakes} map.
     */
    private final Set<Snake> snakesView = Collections.unmodifiableSet(snakes.keySet());
    private int foodVersion = 0;
    private ByteBuffer encodedFoodData;

    public WorldChunk(World world, double left, double bottom, double width, double height, int x, int y) {
        assert (width > 0.0);
        assert (height > 0.0);

        this.x = (byte) x;
        this.y = (byte) y;

        box = new BoundingBox(left, left + width, bottom, bottom + height);
        this.world = world;
    }

    private void onFoodChange() {
        foodVersion++;
        encodedFoodData = null;
    }

    public void addNeighbor(WorldChunk neighbor) {
        assert (neighbor != null);
        assert (neighbors.size() < 8);
        neighbors.add(neighbor);
    }

    public void addFood() {
        Food.spawnAt(this);
    }

    public void addFood(Food food) {
        foodList.add(food);
        onFoodChange();
    }

    public void removeFood(List<Food> foodToRemove) {
        if (foodToRemove.isEmpty()) {
            return;
        }

        if (foodList.removeAll(foodToRemove)) {
            onFoodChange();
        }
    }

    public void addSnakeChunk(SnakeChunk snakeChunk) {
        assert (Math.sqrt(BoundingBox.distance(snakeChunk.getBoundingBox(), box)) <= 0.5 * world.getConfig().snakes.maxWidth);

        if (!snakeChunks.add(snakeChunk)) {
            // SnakeChunk has already been added, no further actions required
            return;
        }

        // initialize or increment SnakeChunk counter
        snakes.merge(snakeChunk.getSnake(), 1, Integer::sum);
        assert (snakes.get(snakeChunk.getSnake()) > 0);
    }

    /**
     * Return the food in this chunk encoded into a {@link ByteBuffer}.
     * The encoding is will be performed only when necessary.
     */
    public ByteBuffer getEncodedFoodData() {
        // every food change should reset encodedFoodData to null
        if (encodedFoodData != null) {
            // return cached data
            return encodedFoodData.asReadOnlyBuffer().flip();
        }

        // encode food data
        final int numFood = Math.min(foodList.size(), Character.MAX_VALUE);
        ByteBuffer buffer = ByteBuffer.allocate(FOOD_HEADER_SIZE + numFood * Food.BYTE_SIZE);

        // header
        buffer.put(this.x);
        buffer.put(this.y);
        buffer.putChar((char) foodList.size());

        // body
        assert (foodList.isEmpty() || buffer.hasRemaining());
        foodList.stream().limit(Character.MAX_VALUE).forEach(food -> food.addToByteBuffer(buffer));
        assert (!buffer.hasRemaining());

        // cache data for next call
        encodedFoodData = buffer;

        return encodedFoodData.asReadOnlyBuffer().flip();
    }

    public int getFoodCount() {
        return foodList.size();
    }

    public int getSnakeChunkCount() {
        return snakeChunks.size();
    }

    public Stream<Food> streamFood() {
        return foodList.stream();
    }

    /**
     * Removes {@link SnakeChunk}s that are junk from this {@link WorldChunk}.
     */
    public void removeOldSnakeChunks() {
        // remove SnakeChunks
        snakeChunks.removeIf(snakeChunk -> {
            if (!snakeChunk.isJunk()) {
                // keep this SnakeChunk
                return false;
            }

            // update SnakeChunk count
            snakes.computeIfPresent(
                    snakeChunk.getSnake(),
                    (snake, chunks) -> chunks - 1
            );

            // remove this SnakeChunk
            return true;
        });

        // remove Snakes
        snakes.entrySet().removeIf(entry -> entry.getValue() <= 0);
    }

    public String toString() {
        return "WorldChunk(" + x + "," + y + ")";
    }

    public Stream<SnakeChunk> streamSnakeChunks() {
        return snakeChunks.stream().filter(Predicate.not(SnakeChunk::isJunk));
    }

    /**
     * Every food change (additions/deletions) will increment this version.
     * Can be used to detect changes.
     */
    public int getFoodVersion() {
        assert foodVersion >= 0;
        return foodVersion;
    }

    /**
     * Get a readonly collection of snakes that have {@link SnakeChunk}s in this {@link WorldChunk}.
     */
    public Collection<Snake> getSnakes() {
        return snakesView;
    }

    public Vector findSnakeSpawnPosition(Random rnd) {
        GameConfig config = world.getConfig();
        final int NUMBER_OF_ATTEMPTS = 42;
        Vector position = new Vector(rnd, box);
        if (snakeChunks.isEmpty()) {
            return position;
        }

        for (int i = 0; i < NUMBER_OF_ATTEMPTS; i++) {
            BoundingBox potentialSpawnArea =
                    new BoundingBox(position, config.snakes.startLength + config.snakes.minWidth,
                            config.snakes.startLength + config.snakes.minWidth);

            var areaClear = snakeChunks.stream().noneMatch(snakeChunk ->
                    BoundingBox.intersect(potentialSpawnArea, snakeChunk.getBoundingBox()));
            if (areaClear) {
                return position;
            } else {
                position = new Vector(rnd, box);
            }
        }
        throw new RuntimeException("No free spawn position found!");
    }

    @Override
    public int hashCode() {
        return (x << 8) + y;
    }
}
