import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.HashSet;

import static game.world.WorldChunkFactory.createChunks;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WorldChunkTest {
    @Test
    void testNumberOfChunks() {
        int n = 4;
        int m = 4;
        var chunks = createChunks(32.0, n, m);

        assertEquals(n * m, chunks.size());
    }

    @Test
    void testNoNulls() {
        int n = 6;
        int m = 6;
        var chunks = createChunks(16.0, n, m);
        chunks.forEach(Assertions::assertNotNull);
    }

    @Test
    void testNeighbors() {
        int m = 4;
        var chunks = createChunks(32.0, m, m);

        int n = chunks.size();

        var outerChunks = 4 * (m - 1);
        var innerChunks = n - outerChunks;
        var has8Neighbors = chunks.stream().filter(c -> c.neighbors.size() == 8).count();
        assertEquals(innerChunks, has8Neighbors);

        chunks.forEach(chunk -> {
            var neighborSet = new HashSet<>(chunk.neighbors);
            assertEquals(chunk.neighbors.size(), neighborSet.size());
        });
    }
}
