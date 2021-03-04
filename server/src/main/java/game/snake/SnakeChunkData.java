package game.snake;

import math.Vector;

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

    /**
     * Checks if the ball at position {@code position} and radius {@code radius}
     * collides with the snake within this chunk.
     * @param position
     * @param radius
     * @return
     */
    boolean doesCollideWith(Vector position, double radius);
}
