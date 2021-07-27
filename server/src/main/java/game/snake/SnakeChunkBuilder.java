package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class SnakeChunkBuilder implements SnakeChunkData {
    private final Snake snake;
    private final short id;
    private final ChainCodeCoder coder;

    private Vector end;
    private float endDirection;
    private int numberOfChainCodes = 0;
    private double x, y;
    private float direction;
    private double minX, maxX, minY, maxY;
    private double length = 0.0;
    private int lastSteps = 0;
    private boolean lastFast = false;
    private int lastDirDelta = 0;
    private List<WorldChunk> linkedWorldChunks = new LinkedList<>();

    private ByteBuffer chunkByteBuffer;
    private List<Vector> points = new LinkedList<>();

    public SnakeChunkBuilder(ChainCodeCoder coder, Snake snake, short chunkId) {
        this.snake = snake;
        this.id = chunkId;
        this.coder = coder;

        end = snake.headPosition.clone();
        points.add(end.clone());
        endDirection = snake.headDirection;
        direction = endDirection;

        minX = maxX = x = end.x;
        minY = maxY = y = end.y;

        chunkByteBuffer = createChunkBuffer();
    }

    /**
     * Encoding:
     * <p>
     * Byte(s) | Description
     * ================= HEADER ===================
     * 0-1       snake id (short)
     * 2-3       chunk id (short)
     * 4         n: number of chain codes in this chunk (byte)
     * 5-8       end direction (single float)
     * 9-12      end position x (single float)
     * 13-16     end position y (single float)
     * 17-20     offset within snake
     * ================= CONTENT ===================
     * 21-(21+n) n ChainCodes (n bytes), 21+n < 128
     *
     * @return Chunk encoded in 128 Bytes of which the first 21 Bytes are the Header
     */
    private ByteBuffer createChunkBuffer() {
        ByteBuffer buffer = ByteBuffer.allocate(SnakeChunk.BYTE_SIZE);

        // chunk header
        buffer.putShort(this.snake.id);
        buffer.putShort(this.id);
        buffer.put((byte) this.numberOfChainCodes);
        buffer.putFloat(this.endDirection);
        buffer.putFloat((float) this.end.x);
        buffer.putFloat((float) this.end.y);
        assert (buffer.position() == SnakeChunk.BUFFER_OFFSET_POS);
        buffer.putFloat(0.0f);
        assert (buffer.position() == SnakeChunk.HEADER_BYTE_SIZE);

        return buffer;
    }

    public void append(int dirDelta, boolean fast) {
        if (this.chunkByteBuffer.position() >= SnakeChunk.BYTE_SIZE) {
            throw new IllegalStateException("Buffer is full!");
        }

        direction += coder.decodeDirectionChange(dirDelta);
        final double stepSize = fast ? snake.config.fastSnakeSpeed : snake.config.snakeSpeed;
        x += Math.cos(direction);
        y += Math.sin(direction);
        points.add(new Vector(x, y));

        // update chaincode
        length += stepSize;

        // path compression?
        if (canUpdatePreviousChainCode(dirDelta, fast)) {
            // increase steps of last chaincode
            chunkByteBuffer.put(
                    this.chunkByteBuffer.position() - 1,
                    coder.encode(lastDirDelta, fast, lastSteps + 1)
            );
            lastSteps++;
        } else {
            // add new chaincode
            this.chunkByteBuffer.put(coder.encode(dirDelta, fast, 1));
            this.numberOfChainCodes++;
            this.chunkByteBuffer.put(SnakeChunk.BUFFER_N_POS, (byte) this.numberOfChainCodes);

            // reset path compression vars
            lastFast = fast;
            lastSteps = 1;
            lastDirDelta = dirDelta;
        }

        // update bounding box
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    public SnakeChunk build() {
        if (!isFull()) {
            throw new IllegalStateException();
        }

        BoundingBox box = new BoundingBox(minX, maxX, minY, maxY);
        double chunkWidth = maxX - minX;
        double chunkHeight = maxY - minY;

        return new SnakeChunk(snake, chunkByteBuffer, box, (float) length, points);
    }

    private boolean canUpdatePreviousChainCode(int dirDelta, boolean fast) {
        final boolean isNotFirst = this.chunkByteBuffer.position() > SnakeChunk.HEADER_BYTE_SIZE;
        final boolean noDirectionChange = dirDelta == 0;
        final boolean stepsCanBeIncreased = lastSteps < ChainCodeCoder.MAX_STEPS;
        final boolean fastIsUnchanged = lastFast == fast;
        return isNotFirst && noDirectionChange && stepsCanBeIncreased && fastIsUnchanged;
    }

    public boolean isFull() {
        return this.chunkByteBuffer.position() == SnakeChunk.BYTE_SIZE;
    }

    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
    }

    public Snake getSnake() {
        return this.snake;
    }

    public int getByteSize() {
        return SnakeChunk.HEADER_BYTE_SIZE + numberOfChainCodes;
    }

    public boolean isEmpty() {
        return numberOfChainCodes == 0;
    }

    public int getUniqueId() {
        return this.chunkByteBuffer.getInt(0);
    }

    public float getLength() {
        return (float) this.length;
    }

    @Override
    public BoundingBox getBoundingBox() {
        return new BoundingBox(minX, maxX, minY, maxY);
    }

    @Override
    public void linkWorldChunk(WorldChunk worldChunk) {
        linkedWorldChunks.add((worldChunk));
    }

    @Override
    public void destroy() {
        linkedWorldChunks.forEach(lwc -> lwc.removeSnakeChunk(this));
    }
}
