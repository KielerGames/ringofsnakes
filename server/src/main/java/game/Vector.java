package game;

public class Vector {
    public double x;
    public double y;

    public Vector(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public static double distance(Vector a, Vector b) {
        final double dx = a.x - b.x,
                dy = a.y - b.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    public static Vector lerp(Vector a, Vector b, double t) {
        assert !Double.isNaN(t);
        assert Double.isFinite(t);
        final double r = 1.0 - t;

        return new Vector(
                a.x * r + b.x * t,
                a.y * r + b.y * t
        );
    }
}
