package game.world;

import math.BoundingBox;
import math.Vector;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WorldChunkCollectionTest {
    World world = new World();

    @Test
    void testFindIntersectingChunks() {
        var worldChunkSize = world.getConfig().chunks.size;
        var boundingBox = new BoundingBox(Vector.ORIGIN, 1, 1);
        var worldChunks = world.chunks.findIntersectingChunks(boundingBox);
        var originWorldChunk = worldChunks.stream().findAny().orElseThrow();
        var position = originWorldChunk.box.getCenter();
        double epsilon = 0.01;

        var worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 - epsilon);
        assertEquals(1, worldChunksInRadius.size());
        worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 + epsilon);
        assertEquals(5, worldChunksInRadius.size());
    }
}
