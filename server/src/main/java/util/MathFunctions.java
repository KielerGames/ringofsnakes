package util;

public final class MathFunctions {
    private MathFunctions() {}

    public static double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }
}
