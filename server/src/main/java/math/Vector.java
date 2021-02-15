package math;

public class Vector {
    public double x;
    public double y;

    public Vector(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Vector(double alpha) {
        this.x = Math.cos(alpha);
        this.y = Math.sin(alpha);
    }

    public double getAlpha() {
        return Math.atan2(this.y, this.x);
    }

    public void addDirection(double alpha, double stepSize) {
        x += stepSize * Math.cos(alpha);
        y += stepSize * Math.sin(alpha);
    }

    public void add(Vector v, double s) {
        this.x = s * v.x;
        this.y = s * v.y;
    }

    public Vector clone() {
        return new Vector(this.x, this.y);
    }

    public static double distance(Vector a, Vector b) {
        final double dx = a.x - b.x,
                dy = a.y - b.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    public static double distance2(Vector a, Vector b) {
        final double dx = a.x - b.x,
                dy = a.y - b.y;

        return dx * dx + dy * dy;
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
