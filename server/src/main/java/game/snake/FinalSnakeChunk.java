package game.snake;

import lombok.Getter;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.List;

public class FinalSnakeChunk extends SnakeChunk {
    public final static int BYTE_SIZE = 96;

    private final ByteBuffer chunkByteBuffer;
    @Getter private final double dataLength;
    @Getter private final int uniqueId;
    private final BoundingBox boundingBox;
    final private List<SnakePathPoint> pathData;
    private double offsetInSnake = 0.0;
    private SnakeChunk.PointQueryInfo lastQueryInfo;

    protected FinalSnakeChunk(
            Snake snake,
            ByteBuffer buffer,
            BoundingBox box,
            double dataLength,
            SnakePathPoint[] pathData
    ) {
        super(snake);

        assert buffer.position() == BYTE_SIZE;
        assert dataLength > 0;

        this.pathData = List.of(pathData);
        this.pathData.forEach(pd -> pd.setFinalSnakeChunk(this));
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
        return offsetInSnake;
    }

    public void setOffset(double offset) {
        this.offsetInSnake = offset;
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, (float) offset);
    }

    public BoundingBox getBoundingBox() {
        return boundingBox;
    }

    @Override
    public int hashCode() {
        return this.getUniqueId();
    }

    @Override
    public Vector getPositionAt(double inSnakeOffset) {
        var pathData = getPathData();

        if (lastQueryInfo != null && inSnakeOffset >= lastQueryInfo.offset) {
            // Performance optimization: Since points in pathData are ordered by offset
            // we can skip the ones before the last queried point and thereby avoid O(n²)
            // runtime in World#recycleDeadSnake.
            pathData = pathData.subList(lastQueryInfo.index, pathData.size());
        }

        if (lastQueryInfo == null) {
            lastQueryInfo = new SnakeChunk.PointQueryInfo();
        }

        return getPositionAt(inSnakeOffset, pathData, lastQueryInfo);
    }
}