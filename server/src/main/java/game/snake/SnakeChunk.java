package game.snake;

import math.BoundingBox;
import java.nio.ByteBuffer;

public class SnakeChunk {
    public final static int BYTE_SIZE = 128;
    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;

    public ByteBuffer chunkByteBuffer;
    private double length;

    private BoundingBox boundingBox;

    protected SnakeChunk(ByteBuffer buffer, BoundingBox box, double length) {
        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
    }

    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
    }
}