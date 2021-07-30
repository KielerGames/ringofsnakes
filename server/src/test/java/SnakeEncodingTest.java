import game.GameConfig;
import game.snake.ChainCodeCoder;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeChunkBuilder;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

import static org.junit.jupiter.api.Assertions.*;

public class SnakeEncodingTest {
    private static final ChainCodeCoder coder = new ChainCodeCoder(new GameConfig());

    @SuppressWarnings("ConstantConditions")
    @Test
    void testValidityOfConstants() {
        final int HEADER_SIZE = SnakeChunk.HEADER_BYTE_SIZE;
        assertTrue(HEADER_SIZE < SnakeChunk.BYTE_SIZE);
        assertTrue(SnakeChunk.BUFFER_N_POS <= HEADER_SIZE - 1);
        assertTrue(SnakeChunk.BUFFER_OFFSET_POS <= HEADER_SIZE - 4);
    }

    @Test
    void testEarlyChunkBuilding() {
        World world = new World();
        Snake snake = new Snake(new Vector(0, 0), world);
        final short chunkId = 42;
        SnakeChunkBuilder builder = new SnakeChunkBuilder(coder, snake, chunkId);
        assertFalse(builder.isFull());
        builder.append(0, false);
        builder.append(0, true);
        assertFalse(builder.isFull());
        assertThrows(IllegalStateException.class, builder::build);
    }

    @Test
    void testSnakeInfoBuffer() {
        World world = new World();
        Snake snake = new Snake(new Vector(0, 0), world);
        var snakeInfo = snake.getInfo();
        assertEquals(Snake.INFO_BYTE_SIZE, snakeInfo.capacity());
        var buffer = ByteBuffer.allocate(1 + Snake.INFO_BYTE_SIZE);
        buffer.put((byte) 42);
        assertEquals(1, buffer.position());
        buffer.put(snakeInfo);
        assertEquals(buffer.capacity(), buffer.position());
    }

    @Test
    void testSnakeChunkBuffer() {
        World world = new World(64.0, 20);
        Snake snake = new Snake(new Vector(0, 0), world);
        var n = snake.chunks.size();
        var i = 0;


        // fill a chunk
        while (snake.chunks.size() == n) {
            snake.tick();

            if (i++ > 4096) {
                throw new IllegalStateException();
            }
        }

        var chunk = snake.chunks.get(n);
        assertFalse(chunk.isEmpty());
        var chunkBuffer = chunk.getBuffer();
        assertEquals(SnakeChunk.BYTE_SIZE, chunkBuffer.capacity());
        var testBuffer = ByteBuffer.allocate(SnakeChunk.BYTE_SIZE + 1);
        testBuffer.put(chunkBuffer);
        assertEquals(SnakeChunk.BYTE_SIZE, testBuffer.position());
    }
}
