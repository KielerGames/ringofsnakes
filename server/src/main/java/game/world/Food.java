package game.world;

import math.Vector;
import util.ByteUtilities;

import java.nio.ByteBuffer;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

import static util.ByteUtilities.toNormalizedDouble;

public final class Food {
    public static final int BYTE_SIZE = 3;

    public final Vector position;
    public final Size size;
    public final byte color;
    private final byte byteX, byteY;

    private Food(WorldChunk chunk, byte bx, byte by, Size size, byte color) {
        final var dx = chunk.box.minX + toNormalizedDouble(bx) * chunk.box.getWidth();
        final var dy = chunk.box.minY + toNormalizedDouble(by) * chunk.box.getHeight();
        this.position = new Vector(dx, dy);
        this.byteX = bx;
        this.byteY = by;
        this.color = color;
        this.size = size;
    }

    /**
     * Spawn a food item at the given position.
     */
    public static void spawnAt(Vector position, World world, Size size, byte color) {
        final var chunk = world.chunks.findChunk(position);
        final var food = new Food(
                chunk,
                ByteUtilities.fromNormalizedDoubleToByte((position.x - chunk.box.minX) / chunk.box.getWidth()),
                ByteUtilities.fromNormalizedDoubleToByte((position.y - chunk.box.minY) / chunk.box.getHeight()),
                size,
                color
        );
        chunk.addFood(food);
    }

    /**
     * Spawn food at a random position within the given chunk.
     */
    public static void spawnAt(WorldChunk chunk) {
        Random rand = ThreadLocalRandom.current();

        // Generate random position.
        final var bytePosition = new byte[2];
        rand.nextBytes(bytePosition);

        // Pick random color.
        final var color = (byte) rand.nextInt(64);

        // Pick random size.
        final var sizeProb = rand.nextDouble();
        final Size size;
        if (0.6 <= sizeProb && sizeProb < 0.9) {
            size = Size.MEDIUM;
        } else if (0.9 <= sizeProb) {
            size = Size.LARGE;
        } else {
            size = Size.SMALL;
        }

        // Create food and add to world.
        final var food = new Food(chunk, bytePosition[0], bytePosition[1], size, color);
        chunk.addFood(food);
    }

    /**
     * Return {@code true} if this food item has a distance less than or equal to
     * {@code range} from the given point {@code p}.
     */
    public boolean isWithinRange(Vector p, double range) {
        range += size.radius;
        return Vector.distance2(position, p) <= range * range;
    }

    void addToByteBuffer(ByteBuffer buffer) {
        buffer.put(byteX);
        buffer.put(byteY);

        int colorAndSizeData = (size.byteValue << 6) | color;
        assert colorAndSizeData < 256;
        buffer.put((byte) colorAndSizeData);
    }

    public enum Size {
        SMALL(0.64, 0), MEDIUM(1.0, 1), LARGE(1.5, 2);

        public final double radius;
        public final double area;
        public final byte byteValue;

        Size(double radius, int bv) {
            this.radius = radius;
            this.byteValue = (byte) bv;
            this.area = Math.PI * radius * radius;
        }
    }
}
