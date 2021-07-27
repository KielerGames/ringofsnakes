import game.world.WorldChunk;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WorldChunkTest {
    @Test
    void testNoSubDivisions() {
        var chunk = new WorldChunk(42.0, 42.0, 0);
        assertEquals(0, chunk.getChildren().size());
    }

    @Test
    void testSubdivide() {
        var chunk = new WorldChunk(32, 32, 1);
        assertEquals(4, chunk.getChildren().size());

        for (WorldChunk childChunk : chunk.getChildren()) {
            assertEquals(0, childChunk.getChildren().size());
        }
    }

    @Test
    void testNeighbors() {
        int sd = 2;
        var chunk = new WorldChunk(32, 32, sd);

        // get all child chunks at the lowest level
        var children = chunk.getChildren().stream()
                .flatMap(cc -> cc.getChildren().stream())
                .collect(Collectors.toUnmodifiableList());

        int n = (int) Math.pow(4, sd);
        int m = (int) Math.sqrt(n);
        assertEquals(n, children.size());

        var outerChunks = 4 * (m - 1);
        var innerChunks = n - outerChunks;
        var has8Neighbors = children.stream().filter(cc -> cc.getNeighbors().size() == 8).count();
        assertEquals(innerChunks, has8Neighbors);

        for(WorldChunk childChunk : children) {
            var neighbors = childChunk.getNeighbors();
            var neighborSet = new HashSet<>(neighbors);

            assertEquals(neighbors.size(), neighborSet.size());
        }
    }
}
