package game.world;

import math.BoundingBox;
import math.Vector;

import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Stream;

public abstract class WorldChunkCollection {
    private final WorldChunk[] chunks;

    public WorldChunkCollection(WorldChunk[] chunks) {
        assert chunks.length > 0;
        this.chunks = chunks;
    }

    protected abstract int findChunkIndex(Vector point);

    public WorldChunk findChunk(Vector point) {
        return chunks[findChunkIndex(point)];
    }

    public Set<WorldChunk> findIntersectingChunks(BoundingBox box) {
        final var center = box.getCenter();

        final var queue = new LinkedList<WorldChunk>();
        queue.add(findChunk(center));

        final var intersectingChunks = new HashSet<WorldChunk>();

        while (queue.size() > 0) {
            final var chunk = queue.removeFirst();
            intersectingChunks.add(chunk);
            chunk.neighbors.stream()
                    .filter(nc -> !intersectingChunks.contains(nc))
                    .filter(nc -> BoundingBox.intersect(box, nc.box))
                    .forEach(queue::add);
        }

        return intersectingChunks;
    }

    public Stream<WorldChunk> stream() {
        return Stream.of(chunks);
    }

    public int numberOfChunks() {
        return chunks.length;
    }

    public void forEach(Consumer<WorldChunk> consumer) {
        Arrays.asList(chunks).forEach(consumer);
    }
}
