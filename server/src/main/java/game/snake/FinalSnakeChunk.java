package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class FinalSnakeChunk extends SnakeChunk {
    public final static int BYTE_SIZE = 96;

    private final ByteBuffer chunkByteBuffer;
    private final double length;
    private final int uniqueId;
    private final BoundingBox boundingBox;
    private List<SnakePathPoint> pathData;
    private LinkedList<WorldChunk> linkedWorldChunks;
    private double snakeOffset = 0.0;

    protected FinalSnakeChunk(
            Snake snake,
            ByteBuffer buffer,
            BoundingBox box,
            double length,
            List<SnakePathPoint> pathData
    ) {
        super(snake);

        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.pathData = pathData;
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

    public double getLength() {
        return this.length;
    }

    @Override
    public List<SnakePathPoint> getPathData() {
        return pathData;
    }

    @Override
    public double getOffset() {
        return snakeOffset;
    }

    public void setOffset(double offset) {
        this.snakeOffset = offset;
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, (float) offset);
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