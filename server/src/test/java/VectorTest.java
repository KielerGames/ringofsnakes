import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class VectorTest {
    @Test
    void testNormalizeZeroVector() {
        final var zero = new Vector(0.0, 0.0);
        zero.normalize();
        assertEquals(0.0, zero.x);
        assertEquals(0.0, zero.y);
    }
}
