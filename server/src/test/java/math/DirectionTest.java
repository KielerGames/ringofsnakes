package math;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DirectionTest {
    @Test
    void testDotProduct() {
        var random = new Random(314159);

        for (int i = 0; i < 42; i++) {
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
}
