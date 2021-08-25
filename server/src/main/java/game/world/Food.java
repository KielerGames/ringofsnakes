package game.world;

import math.Vector;

import java.nio.ByteBuffer;
import java.util.Random;

import static util.ByteUtilities.toNormalizedDouble;

public class Food {
    public static final int BYTE_SIZE = 3;
    public static final float nutritionalValue = 2f;
    private static final Random rand = new Random();

    public final Vector position;
    public final Size size = Size.SMALL;
    public final byte color;
    private final byte[] bytePosition = new byte[2];
    private final WorldChunk chunk;
    public Boolean isAlive = true;

    public Food(WorldChunk chunk, Vector position, byte color) {
        this.color = color;
        this.position = position;
        // TODO: round to nearest byte position & store byte position

        this.chunk = chunk;
    }

    public Food(WorldChunk chunk) {
        // generate random position
        var data = bytePosition;
        rand.nextBytes(data);

        color = (byte) rand.nextInt(64);

        // TODO: pick random size (?)

        double x = chunk.box.minX + toNormalizedDouble(data[0]) * chunk.box.getWidth();
        double y = chunk.box.minY + toNormalizedDouble(data[1]) * chunk.box.getHeight();
        position = new Vector(x, y);
        this.chunk = chunk;
    }

    public boolean isWithinRange(Vector p, double range) {
        return Vector.distance2(position, p) <= range * range;
    }

    public void addToByteBuffer(ByteBuffer buffer) {
        buffer.put(bytePosition[0]);
        buffer.put(bytePosition[1]);

        int colorAndSizeData = (size.byteValue << 6) | color;
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
