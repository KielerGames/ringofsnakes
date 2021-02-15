package game.snake;

import math.Vector;

import java.nio.ByteBuffer;

public class SnakeChunk {
    private Snake snake;
    public final static int CHUNK_SIZE = 128;
    public final static int CHUNK_HEADER_SIZE = 29;
    private final static int CHUNK_N_POS = 4;
    public final short id;
    public ByteBuffer chunkByteBuffer;
    Vector end;
    double endDirection;
    double length = 0.0;
    double halfWidth;
    private int numberOfChainCodes = 0;
    // bounding box
    private double minX, maxX, minY, maxY;

    private int lastSteps = 0;
    private boolean lastFast = false;
    private int lastDirDelta = 0;

    SnakeChunk(Snake snake, short id) {
        this.snake = snake;
        this.id = id;

        end = snake.headPosition.clone();
        endDirection = snake.headDirection;
        halfWidth = 0.5 * 0.2; // width 0.2

        minX = maxX = end.x;
        minY = maxY = end.y;

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
     * 5-12      end direction (single float)
     * 13-20     end position x (double float)
     * 21-28     end position y (double float)
     * ================= CONTENT ===================
     * 29-(29+n) n ChainCodes (n bytes), 29+n < 128
     *
     * @return Chunk encoded in 128 Bytes of which the first 29 Bytes are the Header
     */
    public ByteBuffer createChunkBuffer() {
        ByteBuffer buffer = ByteBuffer.allocate(CHUNK_SIZE);

        // chunk header
        buffer.putShort(this.snake.id);
        buffer.putShort(this.id);
        buffer.put((byte) this.numberOfChainCodes);
        buffer.putDouble(this.endDirection);
        buffer.putDouble(this.end.x);
        buffer.putDouble(this.end.y);
        assert (buffer.position() == CHUNK_HEADER_SIZE);

        return buffer;
    }

    public void add(Vector headPosition, int dirDelta, boolean fast) {
        if (this.chunkByteBuffer.position() >= CHUNK_SIZE) {
            throw new IllegalStateException("Buffer is full!");
        }

        final var coder = snake.coder;

        // update chaincode
        length += snake.config.snakeSpeed; //TODO: include fast

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
            this.chunkByteBuffer.put(CHUNK_N_POS, (byte) this.numberOfChainCodes);

            // reset path compression vars
            lastFast = fast;
            lastSteps = 1;
            lastDirDelta = dirDelta;
        }

        // update bounding box
        minX = Math.min(minX, headPosition.x - halfWidth);
        minY = Math.min(minY, headPosition.y - halfWidth);
        maxX = Math.max(maxX, headPosition.x + halfWidth);
        maxY = Math.max(maxY, headPosition.y + halfWidth);
    }

    private boolean canUpdatePreviousChainCode(int dirDelta, boolean fast) {
        final boolean isNotFirst = this.chunkByteBuffer.position() > CHUNK_HEADER_SIZE;
        final boolean noDirectionChange = dirDelta == 0;
        final boolean stepsCanBeIncreased = lastSteps < ChainCodeCoder.MAX_STEPS;
        final boolean fastIsUnchanged = lastFast == fast;
        return isNotFirst && noDirectionChange && stepsCanBeIncreased && fastIsUnchanged;
    }

    public boolean isFull() {
        return this.chunkByteBuffer.position() == CHUNK_SIZE;
    }
}