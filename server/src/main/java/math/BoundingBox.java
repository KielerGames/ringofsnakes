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
}
