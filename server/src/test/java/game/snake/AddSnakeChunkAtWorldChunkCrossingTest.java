package game.snake;

import game.GameConfig;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests if snakeChunks are added to worldChunks when a snake moves from one worldChunk to another worldChunk
 */

public class AddSnakeChunkAtWorldChunkCrossingTest {

    @Test
    public void worldChunkCrossingTest(){
        final var snake = SnakeFactory.createTestSnake();
        final var world = snake.world;

        for (int i = 0; i < 512; i++) {
            snake.tick();
            var snakeChunkCount = world.chunks.findChunk(snake.headPosition).streamSnakeChunks().count();
            assertTrue (snakeChunkCount > 0);
        }

    }
}
