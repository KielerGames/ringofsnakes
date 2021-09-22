package game.snake;

import game.GameConfig;
import game.world.World;
import math.Vector;
import util.SnakePointData;

import java.nio.ByteBuffer;
import java.util.LinkedList;

public class Snake {
    public static final int INFO_BYTE_SIZE = 26;
    public static final float START_LENGTH = 8f;
    public static final float MAX_WIDTH_GAIN = 4f;
    public static final float LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 700f;
    public static final float MIN_WIDTH = 0.5f;

    public final GameConfig config = new GameConfig();
    public final short id;
    public byte skin;
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    Vector headPosition;
    private ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
    private final World world;
    public LinkedList<FinalSnakeChunk> chunks = new LinkedList<>();
    public GrowingSnakeChunk currentChunk;
    float headDirection;
    private float length = START_LENGTH;
    private short nextChunkId = 0;
    private float targetDirection;
    private boolean fast = false;
    private double lengthBuffer = 0;
    public boolean alive = true;
    private float pointDataSnakeLength = 0f;


    Snake(short id, World world) {
        this.id = id;
        this.world = world;

        // these values don't change
        snakeInfoBuffer.putShort(0, id);
        snakeInfoBuffer.put(4, skin);
    }

    public void setTargetDirection(float alpha) {
        if (Math.abs(alpha) > Math.PI) {
            System.err.println("Alpha out of range: " + alpha);
        } else {
            this.targetDirection = alpha;
        }
    }

    public void setFast(boolean wantsFast) {
        if (length > config.minLength) {
            this.fast = wantsFast;
        } else {
            this.fast = false;
        }
    }

    public void tick() {
        // update direction
        int encDirDelta = coder.sampleDirectionChange(targetDirection, headDirection);
        double dirDelta = coder.decodeDirectionChange(encDirDelta);
        headDirection += dirDelta;
        // normalize direction
        if (Math.abs(headDirection) > Math.PI) {
            headDirection -= Math.signum(headDirection) * 2.0 * Math.PI;
        }

        // move head & handle length change
        if (fast) {
            shrink(config.burnRate);
            handleLengthChange(config.fastSnakeSpeed);
            headPosition.addDirection(headDirection, config.fastSnakeSpeed);
        } else {
            handleLengthChange(config.snakeSpeed);
            headPosition.addDirection(headDirection, config.snakeSpeed);
        }

        // update chunks
        currentChunk.append(encDirDelta, fast);
        // after an update a chunk might be full
        if (currentChunk.isFull()) {
            System.out.println("chunk " + currentChunk.getUniqueId() + " is full (length: " + currentChunk.getLength() + ")");
            beginChunk();
        }
        float offset = currentChunk.getLength();
        for (FinalSnakeChunk chunk : chunks) {
            chunk.setOffset(offset);
            offset += chunk.getLength();
        }
        if (chunks.size() > 0) {
            FinalSnakeChunk lastChunk = chunks.get(chunks.size() - 1);
            if (lastChunk.isJunk()) {
                chunks.remove(chunks.size() - 1);
            }
        }
        updatePointData();
    }

    private void updatePointData() {
        if (currentChunk == null) {
            throw new IllegalStateException();
        }
        currentChunk.pointData.addFirst(new SnakePointData(new Vector(this.headPosition.x, this.headPosition.y), fast));
        pointDataSnakeLength += fast ? config.fastSnakeSpeed : config.snakeSpeed;

        var currentPointDataList =
                chunks.isEmpty() ? currentChunk.pointData : chunks.getLast().pointData;
        while (!currentPointDataList.isEmpty() && pointDataSnakeLength > length) {
            var p = currentPointDataList.removeLast();
            pointDataSnakeLength -= p.fast ? config.fastSnakeSpeed : config.snakeSpeed;
        }
    }

    public void beginChunk() {
        if (currentChunk != null) {
            assert currentChunk.isFull();

            var snakeChunk = currentChunk.build();
            chunks.add(0, snakeChunk);
            //world.removeSnakeChunk(chunkBuilder);
            world.addSnakeChunk(snakeChunk);
        }

        currentChunk = new GrowingSnakeChunk(coder, this, nextChunkId++);
        world.addSnakeChunk(currentChunk);
    }

    public float getLength() {
        return this.length;
    }

    public ByteBuffer encodeInfo() {
        final var buffer = this.snakeInfoBuffer;
        buffer.putShort(2, currentChunk.id);
        buffer.put(5, (byte) (fast ? 1 : 0));
        buffer.putFloat(6, length);
        buffer.putFloat(10, headDirection);
        buffer.putFloat(14, targetDirection);
        buffer.putFloat(18, (float) headPosition.x);
        buffer.putFloat(22, (float) headPosition.y);
        buffer.position(INFO_BYTE_SIZE);
        return buffer.asReadOnlyBuffer().flip();
    }

    public Vector getHeadPosition() {
        return headPosition;
    }

    public void grow(float amount) {
        assert (amount > 0);
        lengthBuffer += amount;
    }

    public void shrink(float amount) {
        assert (amount > 0);
        var bufferAmount = Math.min(lengthBuffer, amount);
        lengthBuffer -= bufferAmount;
        var snakeAmount = amount - bufferAmount;
        length = (float) Math.max(config.minLength, length - snakeAmount);
    }

    private void handleLengthChange(double snakeSpeed) {
        var lengthChange = Math.min(snakeSpeed, lengthBuffer);

        length += lengthChange;
        lengthBuffer -= lengthChange;
    }

    public float getWidth() {
        //sigmoid(3) is roughly  0.95
        var x = 3 * (length - config.minLength) / LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH;
        return (float) (MIN_WIDTH + (1.0 / (1 + Math.exp(-x)) - 0.5) * MAX_WIDTH_GAIN);

    }

    public void setSnakeInfoBuffer(ByteBuffer snakeInfoBuffer) {
        this.snakeInfoBuffer = snakeInfoBuffer;
    }

    public void setSkin(byte skin) {
        this.skin = skin;
    }
}
