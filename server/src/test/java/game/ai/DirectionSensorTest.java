package game.ai;

import math.Direction;
import org.junit.jupiter.api.Test;

import java.util.Random;

import static math.Direction.TAU;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class DirectionSensorTest {
    private static final double DELTA = 0.5 * TAU / DirectionalSensor.BUCKETS + 1e-8;

    @Test
    void testMinimum() {
        final var sensor = new DirectionalSensor();
        final int n = 3 * DirectionalSensor.BUCKETS;

        for (int i = 0; i < n; i++) {
            sensor.reset();
            final var direction = i * TAU / n;
            sensor.add(direction, -13.0);
            final var extrema = sensor.findExtrema();
            assertEquals(-13.0, extrema.minValue());
            assertEquals(Direction.normalize(direction), extrema.minDirection(), DELTA);
        }
    }

    @Test
    void testMaximum() {
        final var sensor = new DirectionalSensor();
        final int n = 3 * DirectionalSensor.BUCKETS;

        for (int i = 0; i < n; i++) {
            sensor.reset();
            final var direction = i * TAU / n;
            sensor.add(direction, 42.0);
            final var extrema = sensor.findExtrema();
            assertEquals(42.0, extrema.maxValue());
            assertEquals(Direction.normalize(direction), extrema.maxDirection(), DELTA);
        }
    }

    @Test
    void testReset() {
        final var sensor = new DirectionalSensor();
        final var rand = new Random(17062023);

        for (int i = 1; i < 10; i++) {
            sensor.reset();
            sensor.add(Direction.getRandom(rand), 42.0 / i);
            final var extrema = sensor.findExtrema();
            assertEquals(42.0 / i, extrema.maxValue());
        }
    }
}
