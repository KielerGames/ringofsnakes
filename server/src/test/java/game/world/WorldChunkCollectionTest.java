package game.world;

import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WorldChunkCollectionTest {
    World world = new World();

    @Test
    void testFindIntersectingChunks() {
        final var worldChunkSize = world.getConfig().chunks.size;
        final var originWorldChunk = world.chunks.findChunk(Vector.ORIGIN);
        final var position = originWorldChunk.box.getCenter();
        final double epsilon = 0.01;

        var worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 - epsilon);
        assertEquals(1, worldChunksInRadius.size());
        worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 + epsilon);
        assertEquals(5, worldChunksInRadius.size());
    }
}
