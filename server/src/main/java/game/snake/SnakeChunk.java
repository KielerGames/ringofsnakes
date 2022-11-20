package game.snake;

import game.GameConfig;
import game.world.Collidable;
import lombok.Getter;
import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.List;

import static math.MathFunctions.clamp;

public abstract class SnakeChunk implements Collidable {

    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;
    @Getter protected final Snake snake;
    private boolean forceJunk = false;

    protected SnakeChunk(Snake snake) {
        this.snake = snake;
    }

    /**
     * Compute the maximum possible snake chunk length for a given GameConfig.
     */
    public static double getMaximumLength(GameConfig config) {
        return (ChainCodeCoder.MAX_STEPS * FinalSnakeChunk.BYTE_SIZE) * config.snakes.fastSpeed;
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

    public abstract double getDataLength();

    /**
     * The last snake chunk is often only partially used due to the snake length constraint.
     * {@code #getCurrentLength() <= getDataLength()}
     */
    public double getCurrentLength() {
        return clamp(snake.getLength() - getOffset(), 0.0, getDataLength());
    }

    /**
     * Returns an unmodifiable view of this chunks path data ordered by distance from snake head ascending.
     * Can contain "junk" data (offset > length) at the end.
     */
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

    /**
     * Return the minimal bounding box assuming snake width 0.
     */
    public abstract BoundingBox getBoundingBox();

    public abstract double getOffset();

    public Vector getPositionAt(double inSnakeOffset) {
        final var inChunkOffset = inSnakeOffset - getOffset();
        assert 0.0 <= inChunkOffset && inChunkOffset <= getDataLength();

        // TODO: use binary search instead

        double minError = Double.POSITIVE_INFINITY;
        Vector bestPoint = null;

        for (final var pd : getPathData()) {
            final var offset = pd.getOffsetInChunk();
            final var error = Math.abs(inChunkOffset - offset);

            if (error > minError) {
                // path data list is ordered, so it's only going to get worse
                break;
            }

            if (error < minError) {
                minError = error;
                bestPoint = pd.point;
            }
        }

        assert bestPoint != null;
        return bestPoint;
    }

    @Override
    public int hashCode() {
        return getUniqueId();
    }
}
