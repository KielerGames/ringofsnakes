package game.snake;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SnakeWidthTest {
    @Test
    void testLowerBound() {
        final var snake = TestSnakeFactory.createSnake();
        final var config = snake.config;

        for (int i = 0; i < 256; i++) {
            snake.tick();
            assertTrue(snake.getWidth() >= config.snakes.minWidth);
        }
    }

    @Test
    void testUpperBound() {
        final var snake = TestSnakeFactory.createSnake();
        for (int i = 0; i < 256; i++) {
            snake.tick();

            for (double t = 0.0; t <= 1.0; t += 0.01) {
                final var width = snake.getWidthAt(t * snake.getLength());
                assertTrue(width <= snake.getWidth());
            }
        }
    }

    @Test
    void testBoundedMonotonicity() {
        final var snake = TestSnakeFactory.createSnake();

        for (int i = 0; i < 256; i++) {
            snake.tick();
        }

        var lastWidth = snake.getWidth();

        for (double t = 0.0; t <= 1.0; t += 0.01) {
            final var width = snake.getWidthAt(t * snake.getLength());
            assertTrue(width <= lastWidth);
            assertTrue(width >= 0.0);
            lastWidth = width;
        }
    }

    @Test
    void testGrowingSnake() {
        final var snake = TestSnakeFactory.createSnake();
        snake.tick();
        var startWidth = snake.getWidth();

        for (int i = 0; i < 64; i++) {
            snake.tick();
            assertEquals(startWidth, snake.getWidth(), 1e-6);
        }

        snake.grow(64.0);

        var lastWidth = startWidth;
        snake.tick();
        int growingTicks = 0;

        while (snake.getWidth() > lastWidth) {
            snake.tick();
            lastWidth = snake.getWidth();
            growingTicks++;
        }

        assertTrue(growingTicks > 0);
    }

    @Test
    void testMinWidth() {
        final var snake = TestSnakeFactory.createSnake();
        final var config = snake.config;

        snake.shrink(100.0);

        for (int i = 0; i < 50; i++) {
            snake.tick();
        }

        assertEquals(config.snakes.minWidth, snake.getWidth(), 1e-8);
    }
}
