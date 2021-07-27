package game.snake;

import math.BoundingBox;

import java.nio.ByteBuffer;

public interface SnakeChunkData {
    ByteBuffer getBuffer();
    Snake getSnake();
    int getByteSize();
    boolean isEmpty();
    boolean isFull();

    /**
     * The id is a combination of snake id and chunk id
     * @return An id that is unique within the game
     */
    int getUniqueId();

    float getLength();

    BoundingBox getBoundingBox();
}
