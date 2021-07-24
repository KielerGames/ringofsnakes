package math;

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

    public static boolean intersect(BoundingBox a, BoundingBox b) {
        //TODO: implement
        throw new UnsupportedOperationException("Not implemented (yet)");
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

    public double distance(Vector p) {
        return Math.sqrt(distance2(p));
    }
}
