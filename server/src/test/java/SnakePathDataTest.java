import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.snake.SnakePathPoint;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SnakePathDataTest {
    static GameConfig config = new GameConfig();

    static double computeSnakeChunkLength(SnakeChunk chunk) {
        final var snakeLength = chunk.getSnake().getLength();
        return chunk.getPathData().stream()
                .mapToDouble(SnakePathPoint::getOffsetInSnake)
                .filter(offset -> offset < snakeLength)
                .max()
                .orElse(0.0);
    }

    @Test
    void testPathDataLength() {
        final var world = new World(config);
        final var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        int startIterations = 0;
        double lastLength;
        double nextLength = computeSnakeLength(snake);
        do {
            lastLength = nextLength;
            snake.tick();
            nextLength = computeSnakeLength(snake);
            startIterations++;
        } while (nextLength > lastLength);

        assertTrue(startIterations > 1);
        assertTrue(lastLength <= snake.getLength());

        for (int i = 0; i < 256; i++) {
            snake.tick();
            final var length = computeSnakeLength(snake);
            assertEquals(snake.getLength(), length, config.fastSnakeSpeed);
            assertTrue(length < snake.getLength());
        }
    }

    double computeSnakeLength(Snake snake) {
        return snake.streamSnakeChunks().mapToDouble(SnakePathDataTest::computeSnakeChunkLength).sum();
    }
}
