package game.ai;

import java.util.Arrays;

import static math.Direction.TAU;

public class DirectionalSensor {
    public static final int BUCKETS = 16;
    private final double[] values = new double[BUCKETS];

    /**
     * Reset sensor to the initial state (nothing sensed).
     */
    public void reset() {
        Arrays.fill(values, 0.0);
    }

    /**
     * Sense something in the given direction with the given intensity.
     */
    public void add(double direction, double intensity) {
        final int bucket = getBucketIndex(direction);
        values[bucket] += intensity;
    }

    /**
     * Find the maximum and minimum sensation/signal and the corresponding directions.
     */
    public Result findExtrema() {
        var maxValue = Double.NEGATIVE_INFINITY;
        var minValue = Double.POSITIVE_INFINITY;
        int maxIndex = -1;
        int minIndex = -1;

        for (int i = 0; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxIndex = i;
                maxValue = values[i];
            }
            if (values[i] < minValue) {
                minIndex = i;
                minValue = values[i];
            }
        }

        return new Result(
                getBucketDirection(maxIndex),
                maxValue,
                getBucketDirection(minIndex),
                minValue
        );
    }

    private static int getBucketIndex(double direction) {
        return (int) Math.floor(BUCKETS * (direction + Math.PI) / TAU);
    }

    private static double getBucketDirection(int bucketIndex) {
        return bucketIndex * (TAU / BUCKETS) - Math.PI;
    }

    public record Result(
            double maxDirection,
            double maxValue,
            double minDirection,
            double minValue
    ) {
    }
}
