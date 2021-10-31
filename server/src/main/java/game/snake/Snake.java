package game.snake;

import game.GameConfig;
import game.world.Food;
import game.world.World;
import math.Vector;
import util.Direction;

import java.nio.ByteBuffer;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static util.MathFunctions.sigmoid;

public class Snake {
    public static final int INFO_BYTE_SIZE = 26;
    public static final double LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 1024.0;
    private static final Random random = new Random();

    public final GameConfig config;
    public final char id;
    protected final World world;
    private final ChainCodeCoder coder;
    private final ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
    private final LinkedList<FinalSnakeChunk> chunks = new LinkedList<>();
    public byte skin;
    public GrowingSnakeChunk currentChunk;
    protected double length;
    Vector headPosition;
    double headDirection;
    private boolean alive = true;
    private char nextChunkId = 0;
    private double targetDirection;
    private boolean fast = false;
    private double lengthBuffer = 0;
    private double width;
    private double foodTrailBuffer = 0f;

    Snake(char id, World world) {
        this.id = id;
        this.world = world;
        config = world.getConfig();
        coder = new ChainCodeCoder(this);
        length = config.snakes.startLength;
        width = config.snakes.minWidth;

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
            System.err.println("Alpha out of range: " + alpha);
        } else {
            this.targetDirection = alpha;
        }
    }

    public void setFast(boolean wantsFast) {
        if (length > config.snakes.minLength) {
            this.fast = wantsFast;
        } else {
            this.fast = false;
        }
    }

    public void tick() {
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

            final var snakeChunk = currentChunk.build();
            chunks.add(0, snakeChunk);
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
        buffer.putChar(0, id);
        buffer.putChar(2, currentChunk.id);
        buffer.put(4, skin);
        buffer.put(5, (byte) (fast ? 1 : 0));
        buffer.putFloat(6, (float) length);
        buffer.putFloat(10, (float) headDirection);
        buffer.putFloat(14, (float) targetDirection);
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
        final var newLength = Math.max(config.snakes.minLength, length - snakeAmount);
        final var deltaLength = length - newLength;
        length = newLength;
        final var smallFoodNutritionalValue = config.foodNutritionalValue * Food.Size.SMALL.value * Food.Size.SMALL.value;
        foodTrailBuffer += deltaLength * config.foodConversionEfficiency;

        if (foodTrailBuffer >= smallFoodNutritionalValue) {
            foodTrailBuffer -= smallFoodNutritionalValue;
            spawnFoodAtTailPosition();
        }

    }

    private void spawnFoodAtTailPosition() {
        final var tailPosition = getTailPosition();
        final var worldChunk = world.chunks.findChunk(tailPosition);
        Food f = new Food(tailPosition, worldChunk, Food.Size.SMALL, skin);
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
            return width;
        }

        // thinning parameter: 0 -> thinning start, 1 -> snake end
        final var t = (offset - thinningStart) / (length - thinningStart);

        final var thinningFactor = 1.0 - (t * t * t);
        return thinningFactor * width;
    }

    /**
     * Returns the (maximum) width of the snake.
     *
     * @return width
     */
    public double getWidth() {
        return width;
    }

    public Stream<SnakeChunk> streamSnakeChunks() {
        return Stream.concat(Stream.of(currentChunk), chunks.stream());
    }

    public List<SnakeChunk> getSnakeChunks() {
        return streamSnakeChunks().collect(Collectors.toList());
    }

    public boolean isAlive() {
        return alive;
    }

    public void kill() {
        recycleSnake();
        alive = false;
    }

    public Vector getTailPosition() {
        final var lastSnakeChunk = chunks.isEmpty() ? currentChunk : chunks.getLast();
        final var sp = lastSnakeChunk.getPathData().stream()
                .filter(snakePathPoint -> snakePathPoint.getOffsetInSnake() < length)
                .max(Comparator.comparing(SnakePathPoint::getOffsetInSnake));

        if (sp.isPresent()) {
            return sp.get().point;
        }
        return headPosition.clone();
    }

    public Vector getPositionAt(double offset) {
        final var chunk = streamSnakeChunks()
                .filter(snakeChunk -> {
                    final var sco = snakeChunk.getOffset();
                    return sco <= offset && offset <= sco + snakeChunk.getLength();
                })
                .findFirst();

        if (chunk.isEmpty()) {
            return null;
        }

        return chunk.get().getPositionAt(offset);
    }


    private void recycleSnake() {
        //TODO:
        // - consider spawning larger food items for larger snakes
        // - fine adjust food value per dead snake
        final var foodScattering = 1.0;
        final var caloricValueOfSnake = length / 2.0; //TODO: adjust
        final var caloricValueOfFoodSpawn = Food.Size.MEDIUM.value * Food.Size.MEDIUM.value * config.foodNutritionalValue;
        final var numberOfFoodSpawns = (int) (caloricValueOfSnake / caloricValueOfFoodSpawn);
        final var lengthUntilFoodSpawn = length / Math.max(1, numberOfFoodSpawns);

        for (int i = 0; i < numberOfFoodSpawns; i++) {
            final var offset = i * lengthUntilFoodSpawn;
            final var spawnPosition = getPositionAt(offset);
            if (spawnPosition == null) {
                continue;
            }
            spawnPosition.addScaled(new Vector(random.nextDouble(), random.nextDouble()), foodScattering);
            if (!world.box.isWithinSubBox(spawnPosition, 1.0)) {
                continue;
            }
            final var worldChunk = world.chunks.findChunk(spawnPosition);
            final var food = new Food(spawnPosition, worldChunk, Food.Size.MEDIUM, skin);
            worldChunk.addFood(food);
        }
    }

    @Override
    public String toString() {
        return "Snake " + ((int) id);
    }
}
