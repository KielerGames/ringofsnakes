package server.protocol;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.WorldChunk;

import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class GameUpdate {
    private static final int HEADER_SIZE = 3;
    private final List<ByteBuffer> snakeChunkBuffers = new LinkedList<>();
    private final List<ByteBuffer> foodChunkBuffers = new LinkedList<>();
    private final Set<Snake> snakes = new HashSet<>();
    private int snakeChunkBufferSize = 0;
    private int foodChunkBufferSize = 0;

    public void addSnakeChunk(SnakeChunk chunk) {
        if (chunk.isEmpty()) {
            return;
        }

        snakeChunkBuffers.add(chunk.getBuffer());
        snakeChunkBufferSize += chunk.getByteSize();
        addSnake(chunk.getSnake());
    }

    public void addFoodChunk(WorldChunk chunk) {
        var encodedFood = chunk.encodeFood();
        foodChunkBuffers.add(encodedFood);
        foodChunkBufferSize += encodedFood.capacity();
    }

    public void addSnake(Snake snake) {
        snakes.add(snake);
    }

    public ByteBuffer createUpdateBuffer() {
        final int snakeInfoSize = snakes.size() * Snake.INFO_BYTE_SIZE;
        final int bufferSize = HEADER_SIZE + snakeInfoSize + snakeChunkBufferSize + foodChunkBufferSize;
        ByteBuffer buffer = ByteBuffer.allocate(bufferSize);

        assert snakes.size() < 256; // TODO
        assert snakeChunkBuffers.size() < 256; // TODO

        // update header
        buffer.put((byte) snakes.size());
        buffer.put((byte) snakeChunkBuffers.size());
        buffer.put((byte) foodChunkBuffers.size());

        // add data
        snakes.forEach(snake -> buffer.put(snake.getInfo()));
        snakeChunkBuffers.forEach(buffer::put);
        foodChunkBuffers.forEach(buffer::put);

        assert buffer.position() == bufferSize;
        return buffer.asReadOnlyBuffer().flip();
    }

    public boolean isEmpty() {
        return snakes.isEmpty() && foodChunkBuffers.isEmpty();
    }

    @Override
    public String toString() {
        var snakes = this.snakes.stream()
                .map(s -> String.valueOf(s.id))
                .collect(Collectors.joining(","));
        var chunks = snakeChunkBuffers.stream()
                .map(c -> String.valueOf(c.getInt(0)))
                .collect(Collectors.joining(","));
        return "GameUpdate { snakes: " + snakes + ", chunks: " + chunks + " }";
    }
}
