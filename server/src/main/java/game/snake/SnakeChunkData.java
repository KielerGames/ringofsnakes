package game.snake;

import java.nio.ByteBuffer;

public interface SnakeChunkData {
    ByteBuffer getBuffer();
    Snake getSnake();
    int getByteSize();
    boolean isEmpty();

    /**
     * The id is a combination of snake id and chunk id
     * @return An id that is unique within the game
     */
    int getUniqueId();
}
