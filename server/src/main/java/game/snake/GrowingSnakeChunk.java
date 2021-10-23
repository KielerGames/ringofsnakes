package game.snake;

import game.world.WorldChunk;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class GrowingSnakeChunk extends SnakeChunk {
    public final short id;
    private final List<SnakePathPoint> pathData = new LinkedList<>();
    private final ChainCodeCoder coder;
    private final Vector end;
    private final float endDirection;
    private final List<WorldChunk> linkedWorldChunks = new LinkedList<>();
    private final ByteBuffer chunkByteBuffer;
    private int numberOfChainCodes = 0;
    private double x, y;
    private float direction;
    private double minX, maxX, minY, maxY;
    private double length = 0.0;
    private int lastSteps = 0;
    private boolean lastFast = false;
    private int lastDirDelta = 0;

    public GrowingSnakeChunk(ChainCodeCoder coder, Snake snake, short chunkId) {
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
        ByteBuffer buffer = ByteBuffer.allocate(FinalSnakeChunk.BYTE_SIZE);

        // chunk header
        buffer.putShort(this.snake.id);
        buffer.putShort(this.id);
        buffer.put((byte) this.numberOfChainCodes);
        buffer.putFloat(this.endDirection);
        buffer.putFloat((float) this.end.x);
        buffer.putFloat((float) this.end.y);
        assert (buffer.position() == BUFFER_OFFSET_POS);
        buffer.putFloat(0.0f);
        assert (buffer.position() == HEADER_BYTE_SIZE);

        return buffer;
    }

    public void append(int dirDelta, boolean fast) {
        if (this.chunkByteBuffer.position() >= FinalSnakeChunk.BYTE_SIZE) {
            throw new IllegalStateException("Buffer is full!");
        }

        direction += coder.decodeDirectionChange(dirDelta);
        final double stepSize = fast ? snake.config.snake.fastSpeed : snake.config.snake.speed;
        x += Math.cos(direction) * stepSize;
        y += Math.sin(direction) * stepSize;
        length += stepSize;
        pathData.add(0, new SnakePathPoint(this, new Vector(x, y), length));

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
        final var finalPathData = this.pathData.toArray(new SnakePathPoint[0]);
        final var fsc = new FinalSnakeChunk(snake, chunkByteBuffer, box, length, List.of(finalPathData));
        this.pathData.forEach(pd -> pd.setFinalSnakeChunk(fsc));
        return fsc;
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

    public double getLength() {
        return this.length;
    }

    @Override
    public List<SnakePathPoint> getPathData() {
        return pathData;
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
    public double getOffset() {
        return 0.0f;
    }

    @Override
    public int hashCode() {
        return this.getUniqueId();
    }
}
