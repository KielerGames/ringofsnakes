package server.protocol;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.HeatMap;
import game.world.WorldChunk;

import javax.annotation.Nullable;
import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

public class GameUpdate {
    public static final int HEADER_SIZE = 5;
    private static final int ITEM_LIMIT = 255;
    private final List<ByteBuffer> snakeChunkBuffers = new LinkedList<>();
    private final List<ByteBuffer> foodChunkBuffers = new LinkedList<>();
    private final Set<Snake> snakes = new HashSet<>();
    @Nullable private ByteBuffer heatMap = null;
    private int snakeChunkBufferSize = 0;
    private int foodChunkBufferSize = 0;
    private byte ticksSinceLastUpdate = 0;

    public void addSnakeChunk(SnakeChunk chunk) {
        if (!chunk.isEmpty()) {
            if (snakeChunkBuffers.size() < ITEM_LIMIT) {
                snakeChunkBuffers.add(chunk.getBuffer());
                snakeChunkBufferSize += chunk.getByteSize();
            }
        }
        addSnake(chunk.getSnake());
    }

    public void addFoodChunk(WorldChunk chunk) {
        if (foodChunkBuffers.size() >= ITEM_LIMIT) {
            return;
        }
        final var encodedFoodChunk = chunk.encodeFood();
        foodChunkBuffers.add(encodedFoodChunk);
        foodChunkBufferSize += encodedFoodChunk.capacity();
    }

    public void addSnake(Snake snake) {
        if (snakes.size() >= ITEM_LIMIT) {
            return;
        }
        snakes.add(snake);
    }

    public void addHeatMap(HeatMap heatMap) {
        assert this.heatMap == null;
        this.heatMap = heatMap.getBuffer();
    }

    public ByteBuffer createUpdateBuffer() {
        final int snakeInfoSize = snakes.size() * Snake.INFO_BYTE_SIZE;
        int bufferSize = HEADER_SIZE + snakeInfoSize + snakeChunkBufferSize + foodChunkBufferSize;
        if (heatMap != null) {
            bufferSize += heatMap.capacity();
        }
        ByteBuffer buffer = ByteBuffer.allocate(bufferSize);

        assert ticksSinceLastUpdate >= 0; // TODO: should be > 0
        assert snakes.size() < 256;
        assert snakeChunkBuffers.size() < 256;
        assert foodChunkBuffers.size() < 256;

        // update header
        buffer.put(ticksSinceLastUpdate);
        buffer.put((byte) snakes.size());
        buffer.put((byte) snakeChunkBuffers.size());
        buffer.put((byte) foodChunkBuffers.size());
        buffer.put((byte) (heatMap == null ? 0 : 1));

        // add data
        snakes.forEach(snake -> buffer.put(snake.encodeInfo()));
        snakeChunkBuffers.forEach(buffer::put);
        foodChunkBuffers.forEach(buffer::put);
        if (heatMap != null) {
            buffer.put(heatMap);
        }

        assert buffer.position() == bufferSize;
        return buffer.asReadOnlyBuffer().flip();
    }

    public boolean isEmpty() {
        return snakes.isEmpty() && foodChunkBuffers.isEmpty();
    }

    public void setTicksSinceLastUpdate(byte ticks) {
        assert ticks >= 0;
        this.ticksSinceLastUpdate = ticks;
    }

    @Override
    public String toString() {
        return "GameUpdate { snakes: " + snakes.size() + ", foodChunks: " + foodChunkBuffers.size() + " }";
    }
}
