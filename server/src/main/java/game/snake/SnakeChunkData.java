package game.snake;

import java.nio.ByteBuffer;

public interface SnakeChunkData {
    ByteBuffer getBuffer();
    Snake getSnake();
    int getByteSize();
    boolean isEmpty();
}
