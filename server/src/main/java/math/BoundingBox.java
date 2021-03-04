package math;

public class BoundingBox {
    private double minX, maxX, minY, maxY;

    public BoundingBox(double minX, double maxX, double minY, double maxY) {
        assert minX <= maxX;
        assert minY <= maxY;

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxY = maxY;
    }

    /**
     * Computes the squared distance between this rectangle and a given point p.
     * The distance is 0 if the point is within the rectangle.
     * @param p A point
     * @return Returns the squared distance
     */
    public double distance2(Vector p) {
        //TODO: implement
        throw new UnsupportedOperationException("Not implemented (yet)");
    }
}
