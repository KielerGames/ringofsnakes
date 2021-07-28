package game.world;

import math.Vector;

import java.nio.ByteBuffer;
import java.util.Random;

import static util.ByteUtilities.toNormalizedDouble;

public class Food {
    private static final Random rand = new Random();

    public final Vector position;
    public final Size size = Size.SMALL;
    public final Color color = Color.RED;
    private final byte[] bytePosition = new byte[2];

    public Food(Vector position) {
        this.position = position;
        // TODO: round to nearest byte position & store byte position
    }

    public Food(WorldChunk chunk) {
        var data = bytePosition;
        rand.nextBytes(data);

        double x = chunk.box.minX + toNormalizedDouble(data[0]) * chunk.box.getWidth();
        double y = chunk.box.minY + toNormalizedDouble(data[1]) * chunk.box.getHeight();
        position = new Vector(x, y);
    }

    public void addToByteBuffer(ByteBuffer buffer) {
        // TODO: implement
    }

    public enum Size {
        SMALL(0.2), MEDIUM(0.42), LARGE(1.0);

        private double value;

        Size(double value) {
            this.value = value;
        }
    }

    public enum Color {
        RED, GREEN, BLUE, YELLOW, WHITE
    }
}
