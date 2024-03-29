package game.snake;

import lombok.Getter;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

public class GrowingSnakeChunk extends SnakeChunk {
    public final char id;
    private final List<SnakePathPoint> pathData = new LinkedList<>();
    private final List<SnakePathPoint> unmodifiablePathData = Collections.unmodifiableList(pathData);
    private final ChainCodeCoder coder;
    private final Vector end;
    private final double endDirection;
    private final ByteBuffer chunkByteBuffer;
    private int numberOfChainCodes = 0;
    private double x, y;
    private double direction;
    private double minX, maxX, minY, maxY;
    @Getter private double dataLength = 0.0;
    private int lastSteps = 0;
    private boolean lastFast = false;
    private int lastDirDelta = 0;

    public GrowingSnakeChunk(ChainCodeCoder coder, Snake snake, char chunkId) {
        super(snake);
        this.id = chunkId;
        this.coder = coder;

        end = snake.headPosition.clone();
        pathData.add(new SnakePathPoint(this, end.clone(), 0.0));
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
     * 0-1       snake id (16-bit integer)
     * 2-3       chunk id (16-bit integer)
     * 4         n: number of chain codes in this chunk (8-bit integer)
     * 5-8       end direction (32-bit float)
     * 9-12      end position x (32-bit float)
     * 13-16     end position y (32-bit float)
     * 17-20     offset within snake (32-bit float)
     * ================= CONTENT ===================
     * 21-(21+n) n ChainCodes (n bytes), 21+n < 128
     *
     * @return Chunk encoded in 128 Bytes of which the first 21 Bytes are the Header
     */
    private ByteBuffer createChunkBuffer() {
        ByteBuffer buffer = ByteBuffer.allocate(FinalSnakeChunk.BYTE_SIZE);

        // chunk header
        buffer.putChar(this.snake.id);
        buffer.putChar(this.id);
        buffer.put((byte) this.numberOfChainCodes);
        buffer.putFloat((float) this.endDirection);
        buffer.putFloat((float) this.end.x);
        buffer.putFloat((float) this.end.y);

        assert (buffer.position() == BUFFER_OFFSET_POS);
        // A new snake chunk will always be starting at the end of the snake
        // and this its offset (from the head) will be 0.
        buffer.putFloat(0.0f);

        assert (buffer.position() == HEADER_BYTE_SIZE);

        return buffer;
    }

    public void append(int dirDelta, boolean fast) {
        if (this.chunkByteBuffer.position() >= FinalSnakeChunk.BYTE_SIZE) {
            throw new IllegalStateException("Buffer is full!");
        }

        direction += coder.decodeDirectionChange(dirDelta);
        final double stepSize = fast ? snake.config.snakes.fastSpeed : snake.config.snakes.speed;
        x += Math.cos(direction) * stepSize;
        y += Math.sin(direction) * stepSize;
        dataLength += stepSize;
        pathData.add(0, new SnakePathPoint(this, new Vector(x, y), dataLength));

        // update chaincode
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
            this.chunkByteBuffer.put(FinalSnakeChunk.BUFFER_N_POS, (byte) this.numberOfChainCodes);

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

    public FinalSnakeChunk build() {
        if (!isFull()) {
            throw new IllegalStateException();
        }
        BoundingBox box = new BoundingBox(minX, maxX, minY, maxY);
        markAsJunk();
        final var finalPathData = pathData.toArray(new SnakePathPoint[0]);
        return new FinalSnakeChunk(snake, chunkByteBuffer, box, dataLength, finalPathData);
    }

    private boolean canUpdatePreviousChainCode(int dirDelta, boolean fast) {
        final boolean isNotFirst = this.chunkByteBuffer.position() > FinalSnakeChunk.HEADER_BYTE_SIZE;
        final boolean noDirectionChange = dirDelta == 0;
        final boolean stepsCanBeIncreased = lastSteps < ChainCodeCoder.MAX_STEPS;
        final boolean fastIsUnchanged = lastFast == fast;
        return isNotFirst && noDirectionChange && stepsCanBeIncreased && fastIsUnchanged;
    }

    public boolean isFull() {
        return this.chunkByteBuffer.position() == FinalSnakeChunk.BYTE_SIZE;
    }

    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
    }

    public int getByteSize() {
        return FinalSnakeChunk.HEADER_BYTE_SIZE + numberOfChainCodes;
    }

    public boolean isEmpty() {
        return numberOfChainCodes == 0;
    }

    public int getUniqueId() {
        return this.chunkByteBuffer.getInt(0);
    }

    @Override
    public List<SnakePathPoint> getPathData() {
        return unmodifiablePathData;
    }

    @Override
    public BoundingBox getBoundingBox() {
        return new BoundingBox(minX, maxX, minY, maxY);
    }

    @Override
    public double getOffset() {
        return 0.0f;
    }

    @Override
    public int hashCode() {
        return this.getUniqueId();
    }
}
