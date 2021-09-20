package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import util.SnakePointData;

import java.nio.ByteBuffer;
import java.util.LinkedList;

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

    public abstract float getLength();

    public abstract LinkedList<SnakePointData> getPointData();

    public boolean isJunk() {
        return !snake.alive;
    }

    public abstract BoundingBox getBoundingBox();

    public abstract void linkWorldChunk(WorldChunk worldChunk);
}
