package math;

import java.util.Random;

public class BoundingBox {
    public final double minX, maxX, minY, maxY;

    public BoundingBox(double minX, double maxX, double minY, double maxY) {
        assert minX <= maxX;
        assert minY <= maxY;

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxY = maxY;
    }

    public BoundingBox(Random rand) {
        minX = rand.nextDouble();
        minY = rand.nextDouble();
        maxX = minX + rand.nextDouble();
        maxY = minY + rand.nextDouble();
    }

    /**
     * Check if two BoundingBox instances intersect.
     *
     * @param a A BoundingBox instance
     * @param b A BoundingBox instance
     * @return {@code true} if BoundingBox a and b intersect
     */
    public static boolean intersect(BoundingBox a, BoundingBox b) {
        final boolean intersectX = intervalsIntersect(a.minX, a.maxX, b.minX, b.maxX);
        final boolean intersectY = intervalsIntersect(a.minY, a.maxY, b.minY, b.maxY);
        return intersectX && intersectY;
    }

    /**
     * @param lb1 Lower bound of interval 1
     * @param ub1 Upper bound of interval 1
     * @param lb2 Lower bound of interval 2
     * @param ub2 Upper bound of interval 2
     * @return {@code true} if [lb1, ub1] and [lb2, ub2] intersect
     */
    private static boolean intervalsIntersect(
            double lb1, double ub1,
            double lb2, double ub2
    ) {
        assert (lb1 <= ub1);
        assert (lb2 <= ub2);

        final boolean separate = ub1 < lb2 || ub2 < lb1;
        return !separate;
    }

    /**
     * @param lb lower bound
     * @param ub upper bound
     * @param p  point to test
     * @return dist([lb, ub], p)
     */
    private static double axisDist(double lb, double ub, double p) {
        assert (lb <= ub);

        if (p < lb) {
            return lb - p;
        } else if (ub < p) {
            return p - ub;
        }

        return 0.0;
    }

    public double getWidth() {
        return maxX - minX;
    }

    public double getHeight() {
        return maxY - minY;
    }

    /**
     * Computes the squared distance between this rectangle and a given point p.
     * The distance is 0 if the point is within the rectangle.
     *
     * @param p A point
     * @return Returns the squared distance
     */
    public double distance2(Vector p) {
        final double dx = axisDist(minX, maxX, p.x), dy = axisDist(minY, maxY, p.y);
        return dx * dx + dy * dy;
    }

    /**
     * Computes the minimum distance between a point and this rectangle.
     * In performance critical section use the distance2 method instead.
     *
     * @param p The point to measure distance to.
     * @return The distance, {@code 0} if the point is inside.
     */
    public double distance(Vector p) {
        return Math.sqrt(distance2(p));
    }

    /**
     * Checks if a given point is within a certain range or inside this rectangle.
     *
     * @param p     A point
     * @param range The maximum min-distance between rect and point
     * @return {@code true} if p is within the given range
     */
    public boolean isWithinRange(Vector p, double range) {
        assert (range >= 0.0);
        return distance2(p) < range * range;
    }
}
