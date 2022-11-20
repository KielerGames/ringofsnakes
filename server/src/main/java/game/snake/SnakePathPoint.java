package game.snake;

import math.Vector;

public final class SnakePathPoint {
    public final Vector point;
    private final double localPathLength;
    private SnakeChunk snakeChunk;

    public SnakePathPoint(GrowingSnakeChunk snakeChunk, Vector point, double localPathLength) {
        assert snakeChunk != null;

        this.snakeChunk = snakeChunk;
        this.point = point;
        this.localPathLength = localPathLength;
    }

    public double getOffsetInChunk() {
        final var offset = snakeChunk.getDataLength() - localPathLength;
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

    public void setFinalSnakeChunk(FinalSnakeChunk snakeChunk) {
        assert this.snakeChunk instanceof GrowingSnakeChunk;
        this.snakeChunk = snakeChunk;
    }
}
