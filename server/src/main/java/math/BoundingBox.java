package math;

import java.util.Random;

/**
 * Axis-aligned bounding box.
 */
public final class BoundingBox {
    public final double minX, maxX, minY, maxY;
    private final double centerX, centerY;

    public BoundingBox(double minX, double maxX, double minY, double maxY) {
        assert minX <= maxX;
        assert minY <= maxY;

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxY = maxY;

        centerX = minX + 0.5 * (maxX - minX);
        centerY = minY + 0.5 * (maxY - minY);
    }

    public BoundingBox(Random rand) {
        minX = rand.nextDouble();
        minY = rand.nextDouble();
        maxX = minX + rand.nextDouble();
        maxY = minY + rand.nextDouble();
        centerX = minX + 0.5 * (maxX - minX);
        centerY = minY + 0.5 * (maxY - minY);
    }

    public BoundingBox(Vector center, double width, double height) {
        assert (width >= 0 && height >= 0);

        minX = center.x - 0.5 * width;
        maxX = center.x + 0.5 * width;
        minY = center.y - 0.5 * height;
        maxY = center.y + 0.5 * height;
        centerX = minX + 0.5 * (maxX - minX);
        centerY = minY + 0.5 * (maxY - minY);
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
     * Compute the squared distance between two bounding boxes.
     */
    public static double distance2(BoundingBox a, BoundingBox b) {
        // center distance
        final var cdX = Math.abs(a.centerX - b.centerX);
        final var cdY = Math.abs(a.centerY - b.centerY);

        // summed extends
        final var extX = 0.5 * (a.getWidth() + b.getWidth());
        final var extY = 0.5 * (a.getHeight() + b.getHeight());

        // axis distances
        final var dX = Math.max(0.0, cdX - extX);
        final var dY = Math.max(0.0, cdY - extY);

        // = length(max(0, abs(a.center - b.center) - (a.extend + b.extend)))²
        return dX * dX + dY * dY;
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

    public boolean isWithinSubBox(Vector p, double inset) {
        assert (inset >= 0.0);
        final var x = minX + inset <= p.x && p.x <= maxX - inset;
        final var y = minY + inset <= p.y && p.y <= maxY - inset;
        return x && y;
    }

    public boolean contains(Vector p) {
        return isWithinSubBox(p, 0.0);
    }

    public Vector getCenter() {
        return new Vector(centerX, centerY);
    }

    @Override
    public String toString() {
        return "AABB { x = [" + minX + "," + maxX + "], y = [" + minY + "," + maxY + "]}";
    }
}
