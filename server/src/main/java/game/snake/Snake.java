package game.snake;

import game.GameConfig;
import game.world.Food;
import game.world.World;
import lombok.Getter;
import math.Direction;
import math.Vector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import util.BitWithShortHistory;

import java.nio.ByteBuffer;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Stream;

import static math.MathFunctions.sigmoid;

public class Snake {
    public static final int INFO_BYTE_SIZE = 26;
    public static final int NUMBER_OF_SKINS = 7;
    public static final double LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 1024.0;
    private static final Logger LOGGER = LoggerFactory.getLogger(Snake.class);
    public final GameConfig config;
    public final char id;
    public final String name;
    @Getter protected final World world;
    private final ChainCodeCoder coder;
    private final ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
    private final LinkedList<FinalSnakeChunk> chunks = new LinkedList<>();
    private final BitWithShortHistory fastHistory = new BitWithShortHistory(false);
    @Getter private final byte skin;
    public GrowingSnakeChunk currentChunk;
    @Getter protected double length;
    @Getter Vector headPosition;
    @Getter double headDirection;
    private char currentChunkId;
    @Getter private boolean alive = true;
    private char nextChunkId = 0;
    private double targetDirection;
    private boolean userWantsFast = false;
    private double lengthBuffer = 0.0;
    @Getter private double width;
    private double foodTrailBuffer = 0f;
    @Getter private int kills = 0;

    Snake(char id, World world, String name, byte skin) {
        this.id = id;
        this.world = world;
        config = world.getConfig();
        coder = new ChainCodeCoder(this);
        length = config.snakes.startLength;
        width = config.snakes.minWidth;
        this.name = name;
        this.skin = skin;

        updateWidth();
    }

    protected void updateWidth() {
        // x in [0,1]
        final var x = (length - config.snakes.minLength) / (LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH - config.snakes.minLength);

        final var maxWidthGain = config.snakes.maxWidth - config.snakes.minWidth;

        // 2 * (sigmoid(3.66) - 0.5) is roughly  0.95
        final var gain = 2.0 * (sigmoid(3.66 * x) - 0.5);

        width = config.snakes.minWidth + gain * maxWidthGain;
    }

    public void setTargetDirection(double alpha) {
        if (Math.abs(alpha) > Math.PI + 1e-4) {
            LOGGER.warn("Alpha out of range: {}", alpha);
            return;
        }

        this.targetDirection = alpha;
    }

    /**
     * Sets the user/controller preference if the snake should go fast or slow.
     * The actual speed will be determined every tick based on multiple factors.
     */
    public void setUserFast(boolean wantsFast) {
        userWantsFast = wantsFast;
    }

    public boolean isFast() {
        return userWantsFast && length > config.snakes.minLength;
    }

    public void tick() {
        assert currentChunk != null : "Snake not fully initialized";

        final boolean fast = isFast();
        fastHistory.set(fast);

        // update direction
        int encDirDelta = coder.sampleDirectionChange(targetDirection, headDirection);
        double dirDelta = coder.decodeDirectionChange(encDirDelta);
        headDirection = Direction.normalize(headDirection + dirDelta);

        // move head & handle length change
        if (fast) {
            shrink(config.snakes.burnRate);
            handleLengthChange(config.snakes.fastSpeed);
            headPosition.addDirection(headDirection, config.snakes.fastSpeed);
        } else {
            handleLengthChange(config.snakes.speed);
            headPosition.addDirection(headDirection, config.snakes.speed);
        }

        updateWidth();

        // update chunks
        currentChunk.append(encDirDelta, fast);

        // ensures that the current SnakeChunk is added to all WorldChunks in which the snake exists
        world.chunks.findIntersectingChunks(headPosition, getWidth() / 2).forEach(wc -> wc.addSnakeChunk(currentChunk));

        // after an update a chunk might be full
        if (currentChunk.isFull()) {
            beginChunk();
        }
        if (currentChunkId != currentChunk.id && !currentChunk.isEmpty()) {
            // the id of an empty chunk (non-existing to the client) would confuse the client
            currentChunkId = currentChunk.id;
        }
        double offset = currentChunk.getDataLength();
        for (FinalSnakeChunk chunk : chunks) {
            chunk.setOffset(offset);
            offset += chunk.getDataLength();
        }
        if (chunks.size() > 0) {
            FinalSnakeChunk lastChunk = chunks.get(chunks.size() - 1);
            if (lastChunk.isJunk()) {
                chunks.remove(chunks.size() - 1);
            }
        }
    }

    void beginChunk() {
        if (currentChunk != null) {
            assert currentChunk.isFull();

            final var snakeChunk = currentChunk.build();
            chunks.add(0, snakeChunk);
            world.addSnakeChunk(snakeChunk);
        }

        currentChunk = new GrowingSnakeChunk(coder, this, nextChunkId++);
        world.addSnakeChunk(currentChunk);
    }

    public ByteBuffer encodeInfo() {
        final var buffer = this.snakeInfoBuffer;
        buffer.putChar(0, id);
        buffer.putChar(2, currentChunkId);
        buffer.put(4, skin);
        buffer.put(5, fastHistory.getHistory());
        buffer.putFloat(6, (float) length);
        buffer.putFloat(10, (float) headDirection);
        buffer.putFloat(14, (float) targetDirection);
        buffer.putFloat(18, (float) headPosition.x);
        buffer.putFloat(22, (float) headPosition.y);
        buffer.position(INFO_BYTE_SIZE);
        return buffer.asReadOnlyBuffer().flip();
    }

    public void grow(double amount) {
        assert (amount > 0);
        lengthBuffer += amount;
    }

    public void shrink(double amount) {
        assert (amount > 0);

        // First take as much as we can from the length buffer.
        final var bufferAmount = Math.min(lengthBuffer, amount);
        lengthBuffer -= bufferAmount;

        // Subtract the remaining amount from the actual snake length.
        final var snakeAmount = amount - bufferAmount;
        final var newLength = Math.max(config.snakes.minLength, length - snakeAmount);
        final var deltaLength = length - newLength;
        length = newLength;

        // Fill foodTrailBuffer if snake length has changed.
        final var smallFoodNutritionalValue = Food.Size.SMALL.nutritionalValue(config);
        foodTrailBuffer += deltaLength * config.foodConversionEfficiency;

        // Spawn food trail items.
        if (foodTrailBuffer >= smallFoodNutritionalValue) {
            foodTrailBuffer -= smallFoodNutritionalValue;
            spawnFoodAtTailPosition();
        }
    }

    private void spawnFoodAtTailPosition() {
        Food.spawnAt(getTailPosition(), world, Food.Size.SMALL, skin);
    }

    private void handleLengthChange(double snakeSpeed) {
        final var lengthChange = Math.min(snakeSpeed, lengthBuffer);

        length += lengthChange;
        lengthBuffer -= lengthChange;
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
            return width;
        }

        // thinning parameter: 0 -> thinning start, 1 -> snake end
        final var t = (offset - thinningStart) / (length - thinningStart);

        final var thinningFactor = 1.0 - (t * t * t);
        return thinningFactor * width;
    }

    public Stream<SnakeChunk> streamSnakeChunks() {
        return Stream.concat(Stream.of(currentChunk), chunks.stream());
    }

    List<SnakeChunk> getSnakeChunks() {
        return streamSnakeChunks().toList();
    }

    /**
     * Set the internal alive flag to false.
     */
    public void kill() {
        if (!alive) {
            return;
        }
        alive = false;
    }

    /**
     * Increment kill counter. Should be called when another snake dies
     * by crashing into this snake.
     */
    public void addKill() {
        if (kills == Integer.MAX_VALUE) {
            // Avoid integer overflow. Very unlikely to ever happen to
            // a normal snake but this could happen to the BoundarySnake.
            return;
        }
        kills++;
    }

    public Vector getTailPosition() {
        final var lastSnakeChunk = chunks.isEmpty() ? currentChunk : chunks.getLast();
        final var sp = lastSnakeChunk.getActivePathData()
                .max(Comparator.comparing(SnakePathPoint::getOffsetInSnake));

        if (sp.isPresent()) {
            return sp.get().point;
        }
        return headPosition.clone();
    }

    /**
     * Get a point on the snakes body.
     * <ul>
     *     <li>{@code getPositionAt(0)} will return the closest point to the snakes head</li>
     *     <li>{@code getPositionAt(lengthOfSnake)} will return the tail position</li>
     * </ul>
     */
    public Vector getPositionAt(double offset) {
        if (offset < 0.0 || offset > length) {
            return null;
        }

        final var chunk = streamSnakeChunks()
                .filter(snakeChunk -> {
                    final var sco = snakeChunk.getOffset();
                    return sco <= offset && offset <= sco + snakeChunk.getDataLength();
                })
                .findFirst();

        //noinspection OptionalIsPresent
        if (chunk.isEmpty()) {
            // This might occur at the tail position. We could add a special case for that
            // and return getTailPosition() instead but that is computationally more expensive
            // and not necessary for the current use case (food spawning).
            return null;
        }

        return chunk.get().getPositionAt(offset);
    }

    @Override
    public String toString() {
        return "Snake " + ((int) id);
    }
}
