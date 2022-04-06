package game.world;

import game.snake.SnakeFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HeatMapTest {
    @Test
    void testEmptyWorld() {
        final var world = new World();
        final var heatMap = world.getHeatMap();
        heatMap.update();
        final var buffer = heatMap.getBuffer();

        assertTrue(buffer.capacity() > 0);

        for (int i = 0; i < buffer.capacity(); i++) {
            assertEquals((byte) 0, buffer.get(i));
        }
    }

    @Test
    void testNonEmptyWorld() {
        final var world = new World();
        final var heatMap = world.getHeatMap();
        final var snake = SnakeFactory.createSnake(world);

        for (int i = 0; i < 10; i++) {
            snake.tick();
        }

        heatMap.update();
        final var buffer = heatMap.getBuffer();
        assertTrue(buffer.capacity() > 0);

        int n = 0;

        for (int i = 0; i < buffer.capacity(); i++) {
            if (buffer.get(i) > (byte) 0) {
                n++;
            }
        }

        assertTrue(n > 0);
    }
}
