package game.snake;

import game.world.World;
import math.BoundingBox;
import math.Vector;
import util.Direction;

import java.util.Random;

public class BoundarySnake extends Snake {
    private static final double DIRECTION_SCATTERING = Math.toRadians(1.5);
    private BoundingBox bottom, right, up, left;
    private Random random = new Random();

    BoundarySnake(char id, World world) {
        super(id, world);
        updateLengthAndWidth();

        // start at bottom center
        headPosition = new Vector(0.0, world.box.minY + getWidth());
        // go right
        headDirection = 0.0;
        setTargetDirection(headDirection);

        final var wb = world.box;
        final var boxWidth = Math.min(3 * getWidth(), world.getConfig().chunks.size);

        /*
         * Position of up and bottom BoundingBox within world:
         * ┌─┬─────────┐
         * │ └─────────┤
         * │           │
         * ├─────────┐ │
         * └─────────┴─┘
         */
        bottom = new BoundingBox(wb.minX, wb.maxX - boxWidth, wb.minY, wb.minY + boxWidth);
        assert Math.abs(bottom.getHeight() - boxWidth) < 1e-8;
        right = new BoundingBox(wb.maxX - boxWidth, wb.maxX, wb.minY, wb.maxY - boxWidth);
        assert Math.abs(right.getWidth() - boxWidth) < 1e-8;
        up = new BoundingBox(wb.minX + boxWidth, wb.maxX, wb.maxY - boxWidth, wb.maxY);
        assert Math.abs(up.getHeight() - boxWidth) < 1e-8;
        left = new BoundingBox(wb.minX, wb.minX + boxWidth, wb.minY + boxWidth, wb.maxY);
        assert Math.abs(left.getWidth() - boxWidth) < 1e-8;
    }

    public void updateLengthAndWidth() {
        final var worldWidth = world.box.getWidth();
        final var worldHeight = world.box.getHeight();
        final var chunkSize = world.getConfig().chunks.size;

        length = 2 * (worldWidth + worldHeight) + 0.75 * chunkSize;

        updateWidth();
    }

    @Override
    public void tick() {
        updateTargetDirection();
        super.tick();
    }

    private void updateTargetDirection() {
        final var distanceFromBorder = getWidth();
        final var p = headPosition;
        final var wb = world.box;
        Vector target = null;

        if (bottom.contains(p)) {
            // go right
            target = new Vector(wb.maxX, wb.minY + distanceFromBorder);
        } else if (right.contains(p)) {
            // go up
            target = new Vector(wb.maxX - distanceFromBorder, wb.maxY);
        } else if (up.contains(p)) {
            // go left
            target = new Vector(wb.minX, wb.maxY - distanceFromBorder);
        } else if (left.contains(p)) {
            // go down
            target = new Vector(wb.minX + distanceFromBorder, wb.minY);
        }

        if (target == null) {
            throw new IllegalStateException("Boundary snake does not know where to go.");
        }

        var direction = Direction.getFromTo(p, target);
        // scattering
        direction = Direction.normalize(direction + random.nextDouble() * DIRECTION_SCATTERING);
        setTargetDirection(direction);
    }

    @Override
    public boolean isAlive() {
        return true;
    }

    @Override
    public void kill() {
        System.err.println("Boundary snake can not be killed.");
    }

    @Override
    public void grow(double amount) {
        // don't do anything
    }

    @Override
    public void shrink(double amount) {
        // don't do anything
    }

    @Override
    public String toString() {
        return "BoundarySnake";
    }
}