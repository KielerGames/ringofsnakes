package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import util.SnakePointData;

import java.nio.ByteBuffer;
import java.util.LinkedList;

public interface SnakeChunk {
    ByteBuffer getBuffer();

    Snake getSnake();

    int getByteSize();

    boolean isEmpty();

    boolean isFull();

    /**
     * The id is a combination of snake id and chunk id
     *
     * @return An id that is unique within the game
     */
    int getUniqueId();

    float getLength();

    LinkedList<SnakePointData> getPointData();

    boolean isJunk();

    BoundingBox getBoundingBox();

    void linkWorldChunk(WorldChunk worldChunk);
}
