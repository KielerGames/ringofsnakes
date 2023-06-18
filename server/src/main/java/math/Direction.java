package math;

import java.util.Random;

public final class Direction {
    public static final double TAU = Math.PI * 2.0;

    public static final double RIGHT = 0.0;
    public static final double UP = 0.5 * Math.PI;
    public static final double LEFT = Math.PI;
    public static final double DOWN = -0.5 * Math.PI;

    /**
     * Normalize an angle to the interval [-PI, PI).
     */
    public static double normalize(double direction) {
        if (!Double.isFinite(direction)) {
            return 0.0;
        }

        while (Math.abs(direction) > Math.PI) {
            direction -= Math.signum(direction) * TAU;
        }

        assert Math.abs(direction) <= Math.PI;

        // Directions should map to a unique angle. PI and -PI are the same direction.
        // We map PI to -PI to make it easy to map directions to array indices.
        if (direction == Math.PI) {
            return -Math.PI;
        }

        return direction;
    }

    /**
     * Get a random angle in the interval [-PI, PI).
     */
    public static double getRandom(Random random) {
        return (random.nextDouble() * 2.0 - 1.0) * Math.PI;
    }

    /**
     * Get the direction from one point towards another.
     */
    public static double getFromTo(Vector from, Vector to) {
        final var x = to.x - from.x;
        final var y = to.y - from.y;
        return Math.atan2(y, x);
    }

    /**
     * The dot product of {@code new Vector(alpha)} and {@code new Vector(beta)}.
     *
     * @param alpha Direction of the first vector.
     * @param beta  Direction of the second vector.
     * @return {@code Vector.dot(new Vector(alpha), new Vector(beta))}
     */
    public static double dot(double alpha, double beta) {
        assert Double.isFinite(alpha);
        assert Double.isFinite(beta);

        // dot(vec(alpha),vec(beta))
        // = cos(alpha)*cos(beta) + sin(alpha)*sin(beta)
        // = cos(alpha - beta)  [addition theorem]
        return Math.cos(alpha - beta);
    }
}
