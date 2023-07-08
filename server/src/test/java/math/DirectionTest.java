package math;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DirectionTest {
    @Test
    void testDotProduct() {
        var random = new Random(314159);

        assertEquals(1.0, Direction.dot(Direction.LEFT, Direction.LEFT), 1e-8);
        assertEquals(0.0, Direction.dot(Direction.UP, Direction.RIGHT), 1e-8);
        assertEquals(-1.0, Direction.dot(Direction.LEFT, Direction.RIGHT), 1e-8);

        for (int i = 0; i < 50; i++) {
            var alpha = Direction.getRandom(random);
            var beta = Direction.getRandom(random);

            var vec1 = new Vector(alpha);
            var vec2 = new Vector(beta);

            assertEquals(Vector.dot(vec1, vec2), Direction.dot(alpha, beta), 1e-8);
        }
    }

    @Test
    void testNormalize() {
        var random = new Random(271828);

        for (int i = 0; i < 42; i++) {
            var alpha1 = 100.0 * (random.nextDouble() - 0.5);
            var alpha2 = Direction.normalize(alpha1);

            assertEquals(1.0, Direction.dot(alpha1, alpha2), 1e-8);
        }
    }

    @Test
    void testNormalizeBounds() {
        assertEquals(-Math.PI, Direction.normalize(Math.PI));
        assertEquals(-Math.PI, Direction.normalize(-Math.PI));
    }

    @Test
    void testAxes() {
        {
            var p1 = new Vector(2.718, 10.0);
            var p2 = new Vector(2.718, 20.0);

            assertEquals(Direction.UP, Direction.getFromTo(p1, p2), 1e-8);
            assertEquals(Direction.DOWN, Direction.getFromTo(p2, p1), 1e-8);
        }
        {
            var p1 = new Vector(-30.0, -7.0);
            var p2 = new Vector(15.7, -7.0);

            assertEquals(Direction.RIGHT, Direction.getFromTo(p1, p2), 1e-8);
            assertEquals(Direction.LEFT, Direction.getFromTo(p2, p1), 1e-8);
        }
    }
}
