package game.world;

import game.snake.SnakeChunkData;
import math.BoundingBox;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class WorldChunk {
    public final BoundingBox box;
    public final List<WorldChunk> neighbors = new ArrayList<>(8);
    private final List<SnakeChunkData> snakeChunks = new LinkedList<>();
    private List<Food> foodList = new LinkedList<>();

    public WorldChunk(double left, double bottom, double width, double height) {
        assert (width > 0.0);
        assert (height > 0.0);

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
        // TODO: implement
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        assert (BoundingBox.intersect(snakeChunk.getBoundingBox(), box));

        snakeChunks.add(snakeChunk);
        snakeChunk.linkWorldChunk(this);
    }

    public int getFoodCount() {
        return foodList.size();
    }

    public void removeSnakeChunk(SnakeChunkData snakeChunk) {
        snakeChunks.remove(snakeChunk);
    }
}
