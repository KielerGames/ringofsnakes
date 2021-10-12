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

    public double getOffsetInSnake() {
        final var relPathOffset = Math.max(0.0, snakeChunk.getLength() - localPathLength);
        return snakeChunk.getOffset() + relPathOffset;
    }

    public double getSnakeWidth() {
        final var offset = getOffsetInSnake();
        return snakeChunk.getSnake().getWidthAt(offset);
    }
}
