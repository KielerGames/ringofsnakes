package game.snake;

import math.Vector;

public class SnakePathPoint {
    public final Vector point;
    private final double localPathLength;
    private final SnakeChunk snakeChunk;

    public SnakePathPoint(SnakeChunk snakeChunk, Vector point, double localPathLength) {
        this.snakeChunk = snakeChunk;
        this.point = point;
        this.localPathLength = localPathLength;
    }

    public double getOffsetInChunk() {
        final var offset = snakeChunk.getLength() - localPathLength;
        assert offset >= 0.0;
        return Math.max(0.0, offset);
    }

    public double getOffsetInSnake() {
        return snakeChunk.getOffset() + getOffsetInChunk();
    }

    public double getSnakeWidth() {
        final var offset = getOffsetInSnake();
        return snakeChunk.getSnake().getWidthAt(offset);
    }
}
