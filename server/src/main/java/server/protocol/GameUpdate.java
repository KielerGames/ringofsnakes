package server.protocol;

import game.snake.Snake;
import game.snake.SnakeChunkData;

import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class GameUpdate {
    private static final int HEADER_SIZE = 2;
    private int snakeChunkBufferSize = 0;
    private List<ByteBuffer> snakeChunkBuffers = new LinkedList<>();
    private Set<Snake> snakes = new HashSet<>();

    public void addSnakeChunk(SnakeChunkData chunk) {
        if(chunk.isEmpty()) {
            return;
        }

        snakeChunkBuffers.add(chunk.getBuffer());
        snakeChunkBufferSize += chunk.getByteSize();
        addSnake(chunk.getSnake());
    }

    public void addSnake(Snake snake) {
        snakes.add(snake);
    }

    public ByteBuffer createBuffer() {
        final int snakeInfoSize = snakes.size() * Snake.INFO_BYTE_SIZE;
        final int bufferSize = HEADER_SIZE + snakeInfoSize + snakeChunkBufferSize;
        ByteBuffer buffer = ByteBuffer.allocate(bufferSize);

        assert snakes.size() < 256; // TODO
        assert snakeChunkBuffers.size() < 256; // TODO

        buffer.put((byte) snakes.size());
        buffer.put((byte) snakeChunkBuffers.size());

        snakes.forEach(snake -> buffer.put(snake.getInfo()));
        snakeChunkBuffers.forEach(buffer::put);

        assert buffer.position() == bufferSize;
        return buffer.asReadOnlyBuffer().flip();
    }

    public boolean isEmpty() {
        return snakes.size() == 0;
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
