package game.world;

import math.Vector;
import util.ByteUtilities;

import java.nio.ByteBuffer;
import java.util.Random;

import static util.ByteUtilities.toNormalizedDouble;

public class Food {
    public static final int BYTE_SIZE = 3;
    private static final Random rand = new Random();

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

    public Food(Vector position, WorldChunk chunk, Size size, byte color) {
        this(
                chunk,
                ByteUtilities.fromNormalizedDoubleToByte((position.x - chunk.box.minX) / chunk.box.getWidth()),
                ByteUtilities.fromNormalizedDoubleToByte((position.y - chunk.box.minY) / chunk.box.getHeight()),
                size,
                color
        );
    }

    public Food(Vector position, WorldChunk chunk, Size size) {
        this(position, chunk, size, (byte) rand.nextInt(64));
    }

    public Food(WorldChunk chunk) {
        // generate position
        final var bytePosition = new byte[2];
        rand.nextBytes(bytePosition);
        // set byte position
        byteX = bytePosition[0];
        byteY = bytePosition[1];
        // set global (double) position
        final var x = chunk.box.minX + toNormalizedDouble(bytePosition[0]) * chunk.box.getWidth();
        final var y = chunk.box.minY + toNormalizedDouble(bytePosition[1]) * chunk.box.getHeight();
        position = new Vector(x, y);

        color = (byte) rand.nextInt(64);

        final var sizeProb = rand.nextDouble();
        if (0.6 <= sizeProb && sizeProb < 0.9) {
            size = Size.MEDIUM;
        } else if (0.9 <= sizeProb) {
            size = Size.LARGE;
        } else {
            size = Size.SMALL;
        }
    }

    public boolean isWithinRange(Vector p, double range) {
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

        public final double value;
        public final byte byteValue;

        Size(double value, int bv) {
            this.value = value;
            this.byteValue = (byte) bv;
        }
    }
}
