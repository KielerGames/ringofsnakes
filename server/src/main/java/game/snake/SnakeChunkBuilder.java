package game.snake;

import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;

public class SnakeChunkBuilder {
    private final Snake snake;
    private final short id;

    private Vector end;
    private double endDirection;
    private int numberOfChainCodes = 0;
    private double minX, maxX, minY, maxY;
    private double length = 0.0;
    private int lastSteps = 0;
    private boolean lastFast = false;
    private int lastDirDelta = 0;

    private ByteBuffer chunkByteBuffer;

    public SnakeChunkBuilder(Snake snake, short chunkId) {
        this.snake = snake;
        this.id = chunkId;

        end = snake.headPosition.clone();
        endDirection = snake.headDirection;

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
    private ByteBuffer createChunkBuffer() {
        ByteBuffer buffer = ByteBuffer.allocate(SnakeChunk.BYTE_SIZE);

        // chunk header
        buffer.putShort(this.snake.id);
        buffer.putShort(this.id);
        buffer.put((byte) this.numberOfChainCodes);
        buffer.putDouble(this.endDirection);
        buffer.putDouble(this.end.x);
        buffer.putDouble(this.end.y);
        assert (buffer.position() == SnakeChunk.HEADER_BYTE_SIZE);

        return buffer;
    }

    public void append(Vector headPosition, int dirDelta, boolean fast) {
        if (this.chunkByteBuffer.position() >= SnakeChunk.BYTE_SIZE) {
            throw new IllegalStateException("Buffer is full!");
        }

        final var coder = snake.coder;

        // update chaincode
        length += fast ? snake.config.fastSnakeSpeed : snake.config.snakeSpeed;

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
        final var halfWidth = 0.5 * snake.getWidth();
        minX = Math.min(minX, headPosition.x - halfWidth);
        minY = Math.min(minY, headPosition.y - halfWidth);
        maxX = Math.max(maxX, headPosition.x + halfWidth);
        maxY = Math.max(maxY, headPosition.y + halfWidth);
    }

    public SnakeChunk build() {
        assert isFull();

        BoundingBox box = new BoundingBox(minX, maxX, minY, maxY);

        return new SnakeChunk(chunkByteBuffer, box, length);
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
}
