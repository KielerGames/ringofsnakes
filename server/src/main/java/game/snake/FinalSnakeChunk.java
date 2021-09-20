package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import util.SnakePointData;

import java.nio.ByteBuffer;
import java.util.LinkedList;

public class FinalSnakeChunk extends SnakeChunk {
    public final static int BYTE_SIZE = 128;

    private final ByteBuffer chunkByteBuffer;
    private final float length;
    private final int uniqueId;
    private final BoundingBox boundingBox;
    public LinkedList<SnakePointData> pointData;
    private LinkedList<WorldChunk> linkedWorldChunks;

    protected FinalSnakeChunk(Snake snake, ByteBuffer buffer, BoundingBox box, float length,
                              LinkedList<SnakePointData> pointData) {
        super(snake);

        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.pointData = pointData;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
        linkedWorldChunks = new LinkedList<>();
    }

    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
    }

    public Snake getSnake() {
        return this.snake;
    }

    public int getByteSize() {
        return BYTE_SIZE;
    }

    public boolean isEmpty() {
        return false;
    }

    public boolean isFull() {
        return true;
    }

    public int getUniqueId() {
        return this.uniqueId;
    }

    public float getLength() {
        return this.length;
    }

    @Override
    public LinkedList<SnakePointData> getPointData() {
        return pointData;
    }

    public void setOffset(float offset) {
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, offset);
    }

    @Override
    public boolean isJunk() {
        return super.isJunk() || chunkByteBuffer.getFloat(BUFFER_OFFSET_POS) >= snake.getLength();
    }

    public BoundingBox getBoundingBox() {
        return boundingBox;
    }

    @Override
    public void linkWorldChunk(WorldChunk worldChunk) {
        linkedWorldChunks.add((worldChunk));
    }

    @Override
    public int hashCode() {
        return this.getUniqueId();
    }
}