package util;

import math.Vector;

import java.util.Random;

public final class Direction {
    public static final double TAU = Math.PI * 2.0;

    public static final double RIGHT = 0.0;
    public static final double UP = 0.5 * Math.PI;
    public static final double LEFT = Math.PI;
    public static final double DOWN = -0.5 * Math.PI;

    public static double normalize(double direction) {
        if (!Double.isFinite(direction)) {
            return 0.0;
        }

        while (Math.abs(direction) > Math.PI) {
            direction -= Math.signum(direction) * TAU;
        }

        assert Math.abs(direction) <= Math.PI;

        return direction;
    }

    public static double getRandom(Random random) {
        return (random.nextDouble() * 2.0 - 1.0) * Math.PI;
    }

    public static double getFromTo(Vector from, Vector to) {
        final var x = to.x - from.x;
        final var y = to.y - from.y;
        return Math.atan2(y, x);
    }
}
