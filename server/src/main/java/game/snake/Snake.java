package game.snake;

import game.GameConfig;
import game.world.World;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

public class Snake {
    public static final int INFO_BYTE_SIZE = 24;
    public static final float START_LENGTH = 8f;
    public static final float MAX_WIDTH_GAIN = 4f;
    public static final float GETTING_FATTER_UNTIL_LENGTH = 142f;
    public static final float STARTING_WIDTH = 0.5f;

    public final GameConfig config = new GameConfig();
    public final short id;
    public byte skin;
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    Vector headPosition;
    private ByteBuffer snakeInfoBuffer;
    private final World world;
    public List<FinalSnakeChunk> chunks = new LinkedList<>();
    public GrowingSnakeChunk chunkBuilder;
    float headDirection;
    private float length = START_LENGTH;
    private short nextChunkId = 0;
    private float targetDirection;
    private boolean fast = false;
    private double lengthBuffer = 0;


    Snake(short id, World world) {
        this.id = id;
        this.world = world;
    }

    public void destroy() {
        chunks.forEach(FinalSnakeChunk::destroy);
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
        chunkBuilder.append(encDirDelta, fast);
        // after an update a chunk might be full
        if (chunkBuilder.isFull()) {
            System.out.println("chunk " + chunkBuilder.getUniqueId() + " is full (length: " + chunkBuilder.getLength() + ")");
            beginChunk();
        }
        float offset = chunkBuilder.getLength();
        for (FinalSnakeChunk chunk : chunks) {
            chunk.setOffset(offset);
            offset += chunk.getLength();
        }
        if (chunks.size() > 0) {
            FinalSnakeChunk lastChunk = chunks.get(chunks.size() - 1);
            if (lastChunk.isJunk()) {
                var removedChunk = chunks.remove(chunks.size() - 1);
                removedChunk.destroy();
            }
        }
    }

    public void beginChunk() {
        if (chunkBuilder != null) {
            assert chunkBuilder.isFull();

            var snakeChunk = chunkBuilder.build();
            chunks.add(0, snakeChunk);
            //world.removeSnakeChunk(chunkBuilder);
            world.addSnakeChunk(snakeChunk);
        }

        chunkBuilder = new GrowingSnakeChunk(coder, this, nextChunkId++);
        world.addSnakeChunk(chunkBuilder);
    }

    public ByteBuffer getLatestMeaningfulBuffer() {
        if (chunkBuilder.isEmpty() && chunks.size() > 0) {
            return chunks.get(chunks.size() - 1).getBuffer();
        }
        return chunkBuilder.getBuffer();
    }

    public float getLength() {
        return this.length;
    }

    public ByteBuffer getInfo() {
        var buffer = this.snakeInfoBuffer;
        buffer.put(3, (byte) (fast ? 1 : 0));
        buffer.putFloat(4, length);
        buffer.putFloat(8, headDirection);
        buffer.putFloat(12, targetDirection);
        buffer.putFloat(16, (float) headPosition.x);
        buffer.putFloat(20, (float) headPosition.y);
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

        var x = Math.min(Math.max(length - START_LENGTH, 0)/GETTING_FATTER_UNTIL_LENGTH, 1.0);
        return (float) (STARTING_WIDTH + (1.0/(1+Math.exp(-x)) - 0.5)*MAX_WIDTH_GAIN);

    }

    public void setSnakeInfoBuffer(ByteBuffer snakeInfoBuffer) {
        this.snakeInfoBuffer = snakeInfoBuffer;
    }

    public void setSkin(byte skin) {
        this.skin = skin;
    }

    public void setHeadPosition(Vector headPosition) {
        this.headPosition = headPosition;
    }

}
