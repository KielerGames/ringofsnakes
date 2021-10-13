import game.GameConfig;
import game.snake.FinalSnakeChunk;
import game.world.WorldChunk;
import math.BoundingBox;
import math.Vector;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class findSnakeSpawnPositionTest {

    @Mock
    FinalSnakeChunk sc1;
    @Mock
    FinalSnakeChunk sc2;
    @Mock
    FinalSnakeChunk sc3;
    @Mock
    FinalSnakeChunk sc4;


    @Test
    void testFindSnakeSpawnPosition() {
        Random rnd = new Random(42);

        var space = GameConfig.snakeStartLength + GameConfig.snakeMinWidth;
        var chunk = new WorldChunk(-space, -space, 2 * space, 2 * space, 0, 0);

        BoundingBox b1 = new BoundingBox(-space, 0, -space, 0);
        BoundingBox b2 = new BoundingBox(0, space, -space, 0);
        BoundingBox b3 = new BoundingBox(-space, 0, 0, space);
        BoundingBox b4 = new BoundingBox(0, space, 0, space);

        when(sc1.getBoundingBox()).thenReturn(b1);
        when(sc2.getBoundingBox()).thenReturn(b2);
        when(sc3.getBoundingBox()).thenReturn(b3);
        when(sc4.getBoundingBox()).thenReturn(b4);

        //Test for empty chunk
        var p1 = chunk.findSnakeSpawnPosition(rnd);
        assertNotNull(p1);

        //Test almost full chunk
        chunk.addSnakeChunk(sc1);
        chunk.addSnakeChunk(sc2);
        chunk.addSnakeChunk(sc3);

        var p2 = chunk.findSnakeSpawnPosition(rnd);
        assertNotNull(p2);

        //Test for full chunk

        chunk.addSnakeChunk(sc4);
        assertThrows(Exception.class, () ->
                chunk.findSnakeSpawnPosition(rnd));
    }
}