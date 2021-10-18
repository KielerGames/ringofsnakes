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
    public static final double MAX_WIDTH_GAIN = 4f;
    public static final double LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 700f;

    public final GameConfig config = new GameConfig();
    public final short id;
    private final ChainCodeCoder coder = new ChainCodeCoder(config);
    private final World world;
    private final ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
    private final LinkedList<FinalSnakeChunk> chunks = new LinkedList<>();
    public byte skin;
    public GrowingSnakeChunk currentChunk;
    Vector headPosition;
    float headDirection;
    private boolean alive = true;
    private double length;
    private short nextChunkId = 0;
    private float targetDirection;
    private boolean fast = false;
    private double lengthBuffer = 0;
    private double maxWidth; // TODO @tim-we rename to something less confusing
    private float foodTrailBuffer = 0f;

    Snake(short id, World world) {
        this.id = id;
        this.world = world;
    }

    private static double computeMaxWidthFromLength(double length, GameConfig config) {
        //sigmoid(3) is roughly  0.95
        final var x = 3.0 * (length - config.minLength) / LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH;
        return (config.snakeMinWidth + (1.0 / (1 + Math.exp(-x)) - 0.5) * MAX_WIDTH_GAIN);
    }

    public void setTargetDirection(float alpha) {
        if (Math.abs(alpha) > Math.PI + 1e-4) {
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
        final var newLength = Math.max(config.minLength, length - snakeAmount);
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
        Food f = new Food(tailPosition, worldChunk, Food.Size.SMALL);
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


    private void recycleSnake() {
        //TODO:
        // - consider spawning larger food items for larger snakes
        // - possible performance optimization by calling findChunk only once per snakeChunk
        // - fine adjust food value per dead snake
        final var foodScattering = 1.0;
        final var caloricValueOfSnake = length / 2.0; //TODO: adjust
        final var caloricValueOfFoodSpawn = Food.Size.MEDIUM.value * Food.Size.MEDIUM.value * config.foodNutritionalValue;
        final var numberOfFoodSpawns = (int) (caloricValueOfSnake / caloricValueOfFoodSpawn);
        final var lengthUntilFoodSpawn = length / Math.max(1, numberOfFoodSpawns);
        final double[] lastSpawn = {0};

        streamSnakeChunks().flatMap(chunk -> chunk.getPathData().stream())
                .forEach(spp -> {
                    if (spp.getOffsetInSnake() < length && spp.getOffsetInSnake() > lastSpawn[0] + lengthUntilFoodSpawn) {
                        final var spawnPosition = spp.point;
                        spawnPosition.addScaled(new Vector(rnd.nextDouble(), rnd.nextDouble()), foodScattering);
                        final var worldChunk = world.chunks.findChunk(spawnPosition); //TODO: optimization?
                        final var food = new Food(spawnPosition, worldChunk, Food.Size.MEDIUM);
                        worldChunk.addFood(food);
                        lastSpawn[0] = spp.getOffsetInSnake();
                    }
                });
    }
}
