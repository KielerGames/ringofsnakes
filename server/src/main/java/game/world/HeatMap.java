package game.world;

import game.GameConfig;

import java.nio.ByteBuffer;
import java.util.function.Supplier;
import java.util.stream.Stream;

public class HeatMap {
    private final ByteBuffer buffer;
    private final int columns;
    private final GameConfig config;
    private final Supplier<Stream<WorldChunk>> chunkSupplier;

    HeatMap(GameConfig config, Supplier<Stream<WorldChunk>> chunkSupplier) {
        columns = config.chunks.columns;
        buffer = ByteBuffer.allocate(config.chunks.rows * columns);
        this.config = config;
        this.chunkSupplier = chunkSupplier;
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

    private byte heat(WorldChunk chunk) {
        // TODO consider using area of snake chunk bounding box intersection as a factor
        double h2 = chunk.streamSnakeChunks()
                .mapToDouble(sc -> sc.getSnake().getWidth() / config.snakes.maxWidth)
                .map(x -> 0.75 * x * x)
                .sum();

        return (byte) (Math.min(1.0, Math.sqrt(h2)) * 255.0);
    }

    public ByteBuffer getBuffer() {
        return buffer.asReadOnlyBuffer().flip();
    }
}
