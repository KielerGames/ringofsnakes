package game.world;

import game.GameConfig;
import game.snake.SnakeChunk;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Stream;


public class WorldChunk {
    public final BoundingBox box;
    public final List<WorldChunk> neighbors = new ArrayList<>(8);
    private final int FOOD_HEADER_SIZE = 4;
    private final List<SnakeChunk> snakeChunks = new LinkedList<>();
    private final byte x, y;
    private int foodVersion = 0;
    private final World world;

    private List<Food> foodList = new LinkedList<>();

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
        // TODO: store time of last change
    }

    public void addNeighbor(WorldChunk neighbor) {
        assert (neighbor != null);
        assert (neighbors.size() < 8);
        neighbors.add(neighbor);
    }

    public void addFood() {
        addFood(Collections.singletonList(new Food(this)));
    }

    public void addFood(Food food) {
        foodList.add(food);
        onFoodChange();
    }

    public void addFood(Collection<Food> foodItemsToAdd) {
        foodList.addAll(foodItemsToAdd);
        onFoodChange();
    }

    public void removeFood(List<Food> foodToRemove) {
        if (foodToRemove.isEmpty()) {
            return;
        }

        foodList.removeAll(foodToRemove);
        onFoodChange();
    }

    public void addSnakeChunk(SnakeChunk snakeChunk) {
        assert (BoundingBox.intersect(snakeChunk.getBoundingBox(), box));

        snakeChunks.add(snakeChunk);
        snakeChunk.linkWorldChunk(this);
    }

    public ByteBuffer encodeFood() {
        ByteBuffer buffer = ByteBuffer.allocate(FOOD_HEADER_SIZE + foodList.size() * Food.BYTE_SIZE);

        buffer.put(this.x);
        buffer.put(this.y);
        buffer.putShort((short) foodList.size());

        assert (foodList.isEmpty() || buffer.hasRemaining());
        foodList.forEach(food -> food.addToByteBuffer(buffer));
        assert (!buffer.hasRemaining());

        return buffer.asReadOnlyBuffer().flip();
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
     * Removes snake chunks that are junk.
     *
     * @return true if any snake chunks have been removed
     */
    public boolean removeOldSnakeChunks() {
        return snakeChunks.removeIf(SnakeChunk::isJunk);
    }

    public String toString() {
        return "WorldChunk(" + x + "," + y + ")";
    }

    public Stream<SnakeChunk> streamSnakeChunks() {
        return snakeChunks.stream().filter(Predicate.not(SnakeChunk::isJunk));
    }

    public int getFoodVersion() {
        assert foodVersion >= 0;
        return foodVersion;
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
}
