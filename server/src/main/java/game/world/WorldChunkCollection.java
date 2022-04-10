package game.world;

import math.BoundingBox;
import math.Vector;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public abstract class WorldChunkCollection {
    private final WorldChunk[] chunks;
    private final List<WorldChunk> chunkList;

    public WorldChunkCollection(WorldChunk[] chunks) {
        assert chunks.length > 0;
        this.chunks = chunks;
        this.chunkList = Arrays.asList(chunks);
    }

    protected abstract int findChunkIndex(Vector point);

    public WorldChunk findChunk(Vector point) {
        return chunks[findChunkIndex(point)];
    }

    /**
     * Find the set of WorldChunks that close to the given BoundingBox.
     * Here close means they either intersect or the distance is below the given bound.
     *
     * @param maxDistance maximum distance between WorldChunk and BoundingBox
     */
    public Set<WorldChunk> findNearbyChunks(BoundingBox box, double maxDistance) {
        final var center = box.getCenter();
        final var maxDist2 = maxDistance * maxDistance;

        // WorldChunks that are close and will be added to the set
        final var queue = new LinkedList<WorldChunk>();
        queue.add(findChunk(center));

        final var nearbyChunks = new HashSet<WorldChunk>(8);

        while (queue.size() > 0) {
            final var chunk = queue.removeFirst();
            nearbyChunks.add(chunk);

            // neighboring WorldChunks are candidates
            chunk.neighbors.stream()
                    .filter(nc -> !nearbyChunks.contains(nc))
                    .filter(nc -> BoundingBox.distance2(box, nc.box) <= maxDist2)
                    .forEach(queue::add);
        }

        return nearbyChunks;
    }

    /**
     * Find a set of WorldChunks that intersect the given BoundingBox.
     */
    public Set<WorldChunk> findIntersectingChunks(BoundingBox box) {
        return findNearbyChunks(box, 0.0);
    }

    public Set<WorldChunk> findIntersectingChunks(Vector position, double radius) {
        final var boundingBox = new BoundingBox(position, 2 * radius, 2 * radius);

        return findIntersectingChunks(boundingBox)
                .stream()
                .filter(wc -> wc.box.distance2(position) < radius * radius)
                .collect(Collectors.toSet());
    }

    public Stream<WorldChunk> stream() {
        return Stream.of(chunks);
    }

    public int numberOfChunks() {
        return chunks.length;
    }

    public void forEach(Consumer<WorldChunk> consumer) {
        chunkList.forEach(consumer);
    }
}
