package math;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class VectorTest {
    @Test
    void testNormalizeZeroVector() {
        final var zero = new Vector(0.0, 0.0);
        zero.normalize();
        assertEquals(0.0, zero.x);
        assertEquals(0.0, zero.y);
    }

    @Test
    void testClone() {
        final var random = new Random(1234);
        final var x = random.nextDouble();
        final var y = random.nextDouble();

        final var v1 = new Vector(x, y);
        final var v2 = v1.clone();

        assertEquals(v1.x, v2.x);
        assertEquals(v1.y, v2.y);

        v1.addDirection(Direction.getRandom(random), 0.1 + random.nextDouble());
        assertTrue(v1.x != x || v1.y != y);

        assertEquals(v2.x, x);
        assertEquals(v2.y, y);
    }
}
