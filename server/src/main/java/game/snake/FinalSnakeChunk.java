package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class FinalSnakeChunk implements SnakeChunk {
    public final static int BYTE_SIZE = 128;
    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;

    private final Snake snake;
    private final ByteBuffer chunkByteBuffer;
    private final float length;
    private final int uniqueId;
    private final Map<Byte, List<Vector>> pointData;
    private final List<WorldChunk> linkedWorldChunks;
    private final BoundingBox boundingBox;


    protected FinalSnakeChunk(Snake snake, ByteBuffer buffer, BoundingBox box, float length,
                              List<Vector> points) {
        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.snake = snake;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
        this.pointData = new HashMap<>();
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

    public void setOffset(float offset) {
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, offset);
    }

    public boolean isJunk() {
        return chunkByteBuffer.getFloat(BUFFER_OFFSET_POS) >= snake.getLength();
    }

    public BoundingBox getBoundingBox() {
        return boundingBox;
    }

    @Override
    public void linkWorldChunk(WorldChunk worldChunk) {
        linkedWorldChunks.add((worldChunk));
    }

    @Override
    public void destroy() {
        linkedWorldChunks.forEach(lwc -> lwc.removeSnakeChunk(this));
    }

    @Override
    public int hashCode() {
        return this.getUniqueId();
    }
}