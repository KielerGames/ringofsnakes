package util;

import math.Vector;

import java.util.Random;

public final class Direction {
    public static final double RIGHT = 0.0;
    public static final double UP = 0.5 * Math.PI;
    public static final double LEFT = Math.PI;
    public static final double DOWN = -0.5 * Math.PI;

    public static double normalize(double direction) {
        if (!Double.isFinite(direction)) {
            return 0.0;
        }

        while (Math.abs(direction) > Math.PI) {
            direction -= Math.signum(direction) * 2.0 * Math.PI;
        }

        assert Math.abs(direction) <= Math.PI;

        return direction;
    }

    public static double getRandom(Random random) {
        return (random.nextDouble() * 2.0 - 1.0) * Math.PI;
    }

    public static double getFromTo(Vector from, Vector to) {
        Vector delta = new Vector(to.x - from.x, to.y - from.y);
        delta.normalize();
        return delta.getAlpha();
    }
}
