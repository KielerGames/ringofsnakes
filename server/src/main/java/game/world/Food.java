package game.world;

import math.Vector;

import java.nio.ByteBuffer;
import java.util.Random;

import static util.ByteUtilities.toNormalizedDouble;

public class Food {
    public static final int BYTE_SIZE = 3;
    public static final float nutritionalValue = 1f;
    private static final Random rand = new Random();

    public final Vector position;
    public final Size size = Size.SMALL;
    public final byte color;
    private final byte byteX, byteY;

    public Food(Vector position, byte color) {
        this.color = color;
        this.position = position;
        // TODO: round to nearest byte position & store byte position
        throw new IllegalCallerException("Not yet implemented");
    }

    public Food(WorldChunk chunk) {
        // generate position
        var bytePosition = new byte[2];
        rand.nextBytes(bytePosition);
        // set byte position
        byteX = bytePosition[0];
        byteY = bytePosition[1];
        // set global (double) position
        var x = chunk.box.minX + toNormalizedDouble(bytePosition[0]) * chunk.box.getWidth();
        var y = chunk.box.minY + toNormalizedDouble(bytePosition[1]) * chunk.box.getHeight();
        position = new Vector(x, y);

        color = (byte) rand.nextInt(64);
        // TODO: pick random size (?)
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
        SMALL(0.2, 0), MEDIUM(0.42, 1), LARGE(1.0, 2);

        public final double value;
        public final byte byteValue;

        Size(double value, int bv) {
            this.value = value;
            this.byteValue = (byte) bv;
        }
    }
}
