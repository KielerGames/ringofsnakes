import game.world.WorldChunk;
import org.junit.jupiter.api.Test;
import server.protocol.GameUpdate;

import static game.world.WorldChunkFactory.createChunks;
import static org.junit.jupiter.api.Assertions.*;

public class GameUpdateTest {
    @Test
    void testEmptyUpdate() {
        var update = new GameUpdate();
        assertTrue(update.isEmpty());
    }

    @Test
    void testUpdateNotEmpty() {
        var chunk = new WorldChunk(0,0, 42,42, 0, 0);
        var update = new GameUpdate();
        update.addFoodChunk(chunk);
        assertFalse(update.isEmpty());
    }
}
