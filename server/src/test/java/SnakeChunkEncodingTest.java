import game.GameConfig;
import game.snake.ChainCodeCoder;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeChunkBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class SnakeChunkEncodingTest {
    private static ChainCodeCoder coder = new ChainCodeCoder(new GameConfig());

    @Test
    void testValidityOfConstants() {
        final int HEADER_SIZE = SnakeChunk.HEADER_BYTE_SIZE;
        assertTrue(HEADER_SIZE < SnakeChunk.BYTE_SIZE);
        assertTrue(SnakeChunk.BUFFER_N_POS <= HEADER_SIZE-1);
        assertTrue(SnakeChunk.BUFFER_OFFSET_POS <= HEADER_SIZE-4);
    }

    @Test
    void testEarlyChunkBuilding() {
        Snake snake = new Snake();
        final short chunkId = 42;
        SnakeChunkBuilder builder = new SnakeChunkBuilder(coder, snake, chunkId);
        assertFalse(builder.isFull());
        builder.append(0, false);
        builder.append(0, true);
        assertFalse(builder.isFull());
        assertThrows(IllegalStateException.class, () -> builder.build());
    }
}
