import game.GameConfig;
import game.snake.*;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

import static org.junit.jupiter.api.Assertions.*;

public class SnakeEncodingTest {
    private static final ChainCodeCoder coder = new ChainCodeCoder(SnakeFactory.createTestSnake());

    @SuppressWarnings("ConstantConditions")
    @Test
    void testValidityOfConstants() {
        final int HEADER_SIZE = FinalSnakeChunk.HEADER_BYTE_SIZE;
        assertTrue(HEADER_SIZE < FinalSnakeChunk.BYTE_SIZE);
        assertTrue(FinalSnakeChunk.BUFFER_N_POS <= HEADER_SIZE - 1);
        assertTrue(FinalSnakeChunk.BUFFER_OFFSET_POS <= HEADER_SIZE - 4);
    }

    @Test
    void testEarlyChunkBuilding() {
        Snake snake = SnakeFactory.createTestSnake();
        final short chunkId = 42;
        GrowingSnakeChunk builder = new GrowingSnakeChunk(coder, snake, chunkId);
        assertFalse(builder.isFull());
        builder.append(0, false);
        builder.append(0, true);
        assertFalse(builder.isFull());
        assertThrows(IllegalStateException.class, builder::build);
    }

    @Test
    void testSnakeInfoBuffer() {
        Snake snake = SnakeFactory.createTestSnake();
        var snakeInfo = snake.encodeInfo();
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
        Snake snake = SnakeFactory.createSnake(new Vector(0, 0), world);
        var n = snake.getSnakeChunks().size();
        var i = 0;


        // fill a chunk
        while (snake.getSnakeChunks().size() == n) {
            snake.tick();

            if (i++ > 4096) {
                throw new IllegalStateException();
            }
        }

        var chunk = snake.getSnakeChunks().get(n);
        assertFalse(chunk.isEmpty());
        var chunkBuffer = chunk.getBuffer();
        assertEquals(FinalSnakeChunk.BYTE_SIZE, chunkBuffer.capacity());
        var testBuffer = ByteBuffer.allocate(FinalSnakeChunk.BYTE_SIZE + 1);
        testBuffer.put(chunkBuffer);
        assertEquals(FinalSnakeChunk.BYTE_SIZE, testBuffer.position());
    }
}
