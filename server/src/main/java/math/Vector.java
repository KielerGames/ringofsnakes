package math;

import java.util.Random;

public final class Vector implements Cloneable {
    public final static Vector ORIGIN = new Vector(0.0, 0.0);

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

    public Vector(Random rand, double maxValue) {
        this.x = (2.0 * rand.nextDouble() - 1.0) * maxValue;
        this.y = (2.0 * rand.nextDouble() - 1.0) * maxValue;
    }

    /**
     * Returns a randomly chosen Vector within the bounds of the provided bounding box b.
     *
     * @param rand instance of Random which is used
     * @param b    bounding box defining the bounds of the vector
     */
    public Vector(Random rand, BoundingBox b) {
        this.x = b.minX + rand.nextDouble() * b.getWidth();
        this.y = b.minY + rand.nextDouble() * b.getHeight();
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

    public static double dot(Vector a, Vector b) {
        return a.x * b.x + a.y * b.y;
    }

    @SuppressWarnings("SpellCheckingInspection")
    public static Vector lerp(Vector a, Vector b, double t) {
        assert !Double.isNaN(t);
        assert Double.isFinite(t);
        final double r = 1.0 - t;

        return new Vector(
                a.x * r + b.x * t,
                a.y * r + b.y * t
        );
    }

    public double getAlpha() {
        return Math.atan2(this.y, this.x);
    }

    public void addDirection(double alpha, double stepSize) {
        x += stepSize * Math.cos(alpha);
        y += stepSize * Math.sin(alpha);
    }

    public void addScaled(Vector v, double s) {
        this.x += s * v.x;
        this.y += s * v.y;
    }

    public void normalize() {
        final var s = 1.0 / Math.max(distance(this, ORIGIN), Double.MIN_NORMAL);
        this.x = s * x;
        this.y = s * y;
    }

    @Override
    public Vector clone() {
        try {
            return (Vector) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new IllegalStateException();
        }
    }

    @Override
    public String toString() {
        return String.format("Vector(%.2f, %.2f)", x, y);
    }
}
