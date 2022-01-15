package game.snake;

import game.world.Collidable;
import game.world.WorldChunk;
import lombok.Getter;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.List;

public abstract class SnakeChunk implements Collidable {

    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;
    @Getter protected final Snake snake;
    private boolean forceJunk = false;

    protected SnakeChunk(Snake snake) {
        this.snake = snake;
    }

    public abstract ByteBuffer getBuffer();

    public abstract int getByteSize();

    public abstract boolean isEmpty();

    public abstract boolean isFull();

    /**
     * The id is a combination of snake id and chunk id
     *
     * @return An id that is unique within the game
     */
    public abstract int getUniqueId();

    public abstract double getLength();

    public abstract List<SnakePathPoint> getPathData();

    public final boolean isJunk() {
        // the length can increase and thus un-junk a snake chunk
        // with the forceJunk flag we force a junk chunk to stay that way
        if (forceJunk) {
            return true;
        }

        final var junk = !snake.isAlive() || getOffset() >= snake.getLength();

        if (junk) {
            markAsJunk();
        }

        return junk;
    }

    protected final void markAsJunk() {
        forceJunk = true;
    }

    public abstract BoundingBox getBoundingBox();

    public abstract double getOffset();

    public Vector getPositionAt(double inSnakeOffset) {
        final var inChunkOffset = inSnakeOffset - getOffset();
        assert 0.0 <= inChunkOffset && inChunkOffset <= getLength();

        // TODO: use binary search instead

        double minError = Double.POSITIVE_INFINITY;
        Vector minPoint = null;

        for (final var pd : getPathData()) {
            final var offset = pd.getOffsetInChunk();
            final var error = Math.abs(inChunkOffset - offset);

            if (error > minError) {
                // path data list is ordered, so it's only going to get worse
                break;
            }

            if (error < minError) {
                minError = error;
                minPoint = pd.point;
            }
        }

        assert minPoint != null;
        return minPoint;
    }
}
