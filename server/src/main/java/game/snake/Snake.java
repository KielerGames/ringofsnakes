package game.snake;

import game.GameConfig;
import game.world.Food;
import game.world.World;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Snake {
    public static final int INFO_BYTE_SIZE = 26;
    public static final double START_LENGTH = 8f;
    public static final double MAX_WIDTH_GAIN = 4f;
    public static final double LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 700f;
    public static final double MIN_WIDTH = 0.5f;

    public final GameConfig config = new GameConfig();
    public final short id;
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    private final World world;
    private final ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
    public byte skin;
    public GrowingSnakeChunk currentChunk;
    public boolean alive = true;
    Vector headPosition;
    float headDirection;
    private LinkedList<FinalSnakeChunk> chunks = new LinkedList<>();
    private double length = START_LENGTH;
    private short nextChunkId = 0;
    private float targetDirection;
    private boolean fast = false;
    private double lengthBuffer = 0;
    private double maxWidth = MIN_WIDTH;

    //TODO: Find a better name, but good luck with that!
    private float foodTrailBuffer = 0f;

    Snake(short id, World world) {
        this.id = id;
        this.world = world;
    }

    private static double computeMaxWidthFromLength(double length, GameConfig config) {
        //sigmoid(3) is roughly  0.95
        final var x = 3.0 * (length - config.minLength) / LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH;
        return (MIN_WIDTH + (1.0 / (1 + Math.exp(-x)) - 0.5) * MAX_WIDTH_GAIN);
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

        // update width
        maxWidth = computeMaxWidthFromLength(length, config);

        // update chunks
        currentChunk.append(encDirDelta, fast);
        // after an update a chunk might be full
        if (currentChunk.isFull()) {
            beginChunk();
        }
        double offset = currentChunk.getLength();
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

    public double getLength() {
        return this.length;
    }

    public ByteBuffer encodeInfo() {
        final var buffer = this.snakeInfoBuffer;
        buffer.putShort(0, id);
        buffer.putShort(2, currentChunk.id);
        buffer.put(4, skin);
        buffer.put(5, (byte) (fast ? 1 : 0));
        buffer.putFloat(6, (float) length);
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

    public void grow(double amount) {
        assert (amount > 0);
        lengthBuffer += amount;
    }

    public void shrink(double amount) {
        assert (amount > 0);
        final var bufferAmount = Math.min(lengthBuffer, amount);
        lengthBuffer -= bufferAmount;
        final var snakeAmount = amount - bufferAmount;
        var newLength = Math.max(config.minLength, length - snakeAmount);
        var deltaLength = length - newLength;
        length = newLength;
        foodTrailBuffer += deltaLength;
        if (foodTrailBuffer * config.foodConversionEfficiency >= config.foodNutritionalValue) {
            foodTrailBuffer = 0;
            spawnFoodAtTailPosition(getTailPosition());
        }

    }

    private void spawnFoodAtTailPosition(Vector tailPosition) {
        var worldChunk = world.chunks.findChunk(getTailPosition());
        Food f = new Food(tailPosition, worldChunk);
        worldChunk.addFood(f);
    }

    private void handleLengthChange(double snakeSpeed) {
        final var lengthChange = Math.min(snakeSpeed, lengthBuffer);

        length += lengthChange;
        lengthBuffer -= lengthChange;
    }

    public void setSkin(byte skin) {
        this.skin = skin;
    }

    /**
     * Get the snake width at a specific point.
     *
     * @param offset The path-distance from the snake head.
     * @return the snake width at the specified point
     */
    public double getWidthAt(double offset) {
        assert offset >= 0.0;

        // the offset after which the snake starts getting thinner
        final var thinningStart = Math.min(0.75, length * 0.025) * length;

        if (offset <= thinningStart) {
            return maxWidth;
        }

        // thinning parameter: 0 -> thinning start, 1 -> snake end
        final var t = (offset - thinningStart) / (length - thinningStart);

        final var thinningFactor = 1.0 - (t * t * t);
        return thinningFactor * maxWidth;
    }

    public double getMaxWidth() {
        return maxWidth;
    }

    public Stream<SnakeChunk> streamSnakeChunks() {
        return Stream.concat(Stream.of(currentChunk), chunks.stream());
    }

    public List<SnakeChunk> getSnakeChunks() {
        return streamSnakeChunks().collect(Collectors.toList());
    }

    public Vector getTailPosition() {
        final var lastSnakeChunk = chunks.isEmpty() ? currentChunk : chunks.getLast();
        var spp = streamSnakeChunks().filter(chunk -> !chunk.isJunk())
                .flatMap(chunk -> chunk.getPathData().stream())
                .filter(snakePathPoint -> snakePathPoint.getOffsetInSnake() < length)
                .max(Comparator.comparing(SnakePathPoint::getOffsetInSnake));

        var sp = lastSnakeChunk.getPathData().stream()
                .filter(snakePathPoint -> snakePathPoint.getOffsetInSnake() < length)
                .max(Comparator.comparing(SnakePathPoint::getOffsetInSnake));

        if (sp.isPresent()) {
            return sp.get().point;
        }
        return headPosition.clone();
    }
}
