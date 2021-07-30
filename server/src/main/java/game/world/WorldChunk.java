package game.world;

import game.snake.SnakeChunkData;
import math.BoundingBox;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class WorldChunk {
    public final BoundingBox box;
    public final List<WorldChunk> neighbors = new ArrayList<>(8);
    private final List<SnakeChunkData> snakeChunks = new LinkedList<>();
    private final byte x, y;

    // TODO: consider different data structures
    private List<Food> foodList = new LinkedList<>();

    public WorldChunk(double left, double bottom, double width, double height, int x, int y) {
        assert (width > 0.0);
        assert (height > 0.0);

        this.x = (byte) x;
        this.y = (byte) y;

        box = new BoundingBox(left, left + width, bottom, bottom + height);
    }

    public void addNeighbor(WorldChunk neighbor) {
        assert (neighbor != null);
        assert (neighbors.size() < 8);
        neighbors.add(neighbor);
    }

    public void addFood() {
        Food food = new Food(this);
        foodList.add(food);
    }

    public void removeFood(Food food) {
        foodList.remove(food);
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        assert (BoundingBox.intersect(snakeChunk.getBoundingBox(), box));

        snakeChunks.add(snakeChunk);
        snakeChunk.linkWorldChunk(this);
    }

    public ByteBuffer encodeFood() {
        final int HEADER_SIZE = 4; //TODO
        ByteBuffer buffer = ByteBuffer.allocate(HEADER_SIZE + foodList.size() * Food.BYTE_SIZE);

        buffer.put(this.x);
        buffer.put(this.y);
        buffer.putShort((short) foodList.size());

        foodList.forEach(food -> food.addToByteBuffer(buffer));

        return buffer;
    }

    public int getFoodCount() {
        return foodList.size();
    }

    public int getSnakeChunkCount() {
        return snakeChunks.size();
    }

    public void removeSnakeChunk(SnakeChunkData snakeChunk) {
        snakeChunks.remove(snakeChunk);
    }

    public String toString() {
        return "WorldChunk(" + x + "," + y + ")";
    }
}
