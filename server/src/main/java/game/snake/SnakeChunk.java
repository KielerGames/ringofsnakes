package game.snake;

import math.BoundingBox;
import java.nio.ByteBuffer;

public class SnakeChunk implements SnakeChunkData {
    public final static int BYTE_SIZE = 128;
    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;

    private final Snake snake;
    private ByteBuffer chunkByteBuffer;
    private double length;
    private int uniqueId;

    private BoundingBox boundingBox;

    protected SnakeChunk(Snake snake, ByteBuffer buffer, BoundingBox box, double length) {
        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.snake = snake;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
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

    public int getUniqueId() {
        return this.uniqueId;
    }
}