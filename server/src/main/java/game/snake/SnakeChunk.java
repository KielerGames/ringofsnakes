package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;

import java.nio.ByteBuffer;
import java.util.List;

public abstract class SnakeChunk {

    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;

    protected final Snake snake;

    protected SnakeChunk(Snake snake) {
        this.snake = snake;
    }

    public abstract ByteBuffer getBuffer();

    public Snake getSnake() {
        return snake;
    }

    public abstract int getByteSize();

    public abstract boolean isEmpty();

    public abstract boolean isFull();

    /**
     * The id is a combination of snake id and chunk id
     *
     * @return An id that is unique within the game
     */
    public abstract int getUniqueId();

    public abstract double getLength();

    public abstract List<SnakePathPoint> getPathData();

    public boolean isJunk() {
        return !snake.alive;
    }

    public abstract BoundingBox getBoundingBox();

    public abstract void linkWorldChunk(WorldChunk worldChunk);

    public abstract double getOffset();
}
