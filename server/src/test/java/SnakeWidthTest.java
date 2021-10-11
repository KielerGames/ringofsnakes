import game.snake.Snake;
import game.snake.SnakeFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SnakeWidthTest {
    @Test
    void testLowerBound() {
        final var snake = SnakeFactory.createSnake();
        for (int i = 0; i < 256; i++) {
            snake.tick();
            assertTrue(snake.getMaxWidth() >= Snake.MIN_WIDTH);
        }
    }

    @Test
    void testUpperBound() {
        final var snake = SnakeFactory.createSnake();
        for (int i = 0; i < 256; i++) {
            snake.tick();

            for (double t = 0.0; t <= 1.0; t += 0.01) {
                final var width = snake.getWidthAt(t * snake.getLength());
                assertTrue(width <= snake.getMaxWidth());
            }
        }
    }

    @Test
    void testBoundedMonotonicity() {
        final var snake = SnakeFactory.createSnake();

        for (int i = 0; i < 256; i++) {
            snake.tick();
        }

        var lastWidth = snake.getMaxWidth();

        for (double t = 0.0; t <= 1.0; t += 0.01) {
            final var width = snake.getWidthAt(t * snake.getLength());
            assertTrue(width <= lastWidth);
            assertTrue(width >= 0.0);
            lastWidth = width;
        }
    }

    @Test
    void testGrowingSnake() {
        final var snake = SnakeFactory.createSnake();
        snake.tick();
        var startWidth = snake.getMaxWidth();

        for (int i = 0; i < 64; i++) {
            snake.tick();
            assertEquals(startWidth, snake.getMaxWidth(), 1e-6);
        }

        snake.grow(64.0);

        var lastWidth = startWidth;
        snake.tick();
        int growingTicks = 0;

        while (snake.getMaxWidth() > lastWidth) {
            snake.tick();
            lastWidth = snake.getMaxWidth();
            growingTicks++;
        }

        assertTrue(growingTicks > 0);
    }
}
