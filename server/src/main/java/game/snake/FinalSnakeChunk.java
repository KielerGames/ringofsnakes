package game.snake;

import lombok.Getter;
import math.BoundingBox;

import java.nio.ByteBuffer;
import java.util.List;

public class FinalSnakeChunk extends SnakeChunk {
    public final static int BYTE_SIZE = 96;

    private final ByteBuffer chunkByteBuffer;
    @Getter private final double dataLength;
    @Getter private final int uniqueId;
    private final BoundingBox boundingBox;
    final private List<SnakePathPoint> pathData;
    private double snakeOffset = 0.0;

    protected FinalSnakeChunk(
            Snake snake,
            ByteBuffer buffer,
            BoundingBox box,
            double dataLength,
            List<SnakePathPoint> pathData
    ) {
        super(snake);

        assert buffer.position() == BYTE_SIZE;
        assert dataLength > 0;

        this.pathData = pathData;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.dataLength = dataLength;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
    }

    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
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
    public int hashCode() {
        return this.getUniqueId();
    }
}