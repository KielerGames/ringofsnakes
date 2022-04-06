package game.world;

import game.GameConfig;
import game.snake.SnakeChunk;

import java.nio.ByteBuffer;
import java.util.function.Supplier;
import java.util.stream.Stream;

public class HeatMap {
    private final ByteBuffer buffer;
    private final int columns;
    private final GameConfig config;
    private final Supplier<Stream<WorldChunk>> chunkSupplier;
    private final double maxSnakeChunkLength;

    HeatMap(GameConfig config, Supplier<Stream<WorldChunk>> chunkSupplier) {
        columns = config.chunks.columns;
        buffer = ByteBuffer.allocate(config.chunks.rows * columns);
        this.config = config;
        this.chunkSupplier = chunkSupplier;
        maxSnakeChunkLength = SnakeChunk.getMaximumLength(config);
    }

    /**
     * Boost low values in [0,1] to [0,1].
     * <ul>
     *     <li>{@code boost(0.0) == 0.0}</li>
     *     <li>{@code boost(1.0) == 1.0}</li>
     *     <li>{@code boost(x) > x} for x in (0,1)</li>
     * </ul>
     */
    private static double boost(double x) {
        return x * (2.0 - x);
    }

    public void update() {
        chunkSupplier.get().forEach(chunk -> {
            // compute buffer index
            final int x = chunk.getX();
            final int y = chunk.getY();
            final int idx = y * columns + x;

            buffer.put(idx, heat(chunk));
        });
    }

    private double snakeChunkHeat(SnakeChunk chunk) {
        final var snake = chunk.getSnake();

        final var w = snake.getWidth() / config.snakes.maxWidth;
        final var s = snake.isFast() ? 1.25 : 1.0;
        final var b = chunk.getCurrentLength() / (0.8 * maxSnakeChunkLength);

        return Math.min(s * boost(w) * boost(b), 1.0);
    }

    private byte heat(WorldChunk chunk) {
        // TODO consider using area of snake chunk bounding box intersection as a factor
        double h = chunk.streamSnakeChunks()
                .mapToDouble(this::snakeChunkHeat)
                .map(HeatMap::boost)
                .sum();

        return (byte) (Math.min(1.0, h) * 255.0);
    }

    public ByteBuffer getBuffer() {
        // the buffers position is still 0 so .flip() must not be called here
        return buffer.asReadOnlyBuffer();
    }
}
