package util;

public final class NumberUtilities {
    private NumberUtilities() {}

    public static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(value, max));
    }
}
