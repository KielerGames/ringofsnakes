package game.snake;

import game.GameConfig;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;
import math.Direction;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

public class SnakeChunkTest {
    static GameConfig config = new GameConfig();

    static double computeSnakeChunkLength(SnakeChunk chunk) {
        final var snakeLength = chunk.getSnake().getLength();
        return chunk.getPathData().stream()
                .filter(pd -> pd.getOffsetInSnake() < snakeLength)
                .mapToDouble(SnakePathPoint::getOffsetInChunk)
                .max()
                .orElse(0.0);
    }

    static double computeSnakeLength(Snake snake) {
        return snake.streamSnakeChunks().mapToDouble(SnakeChunkTest::computeSnakeChunkLength).sum();
    }

    static void tickUntilFullLength(Snake snake) {
        int ticks = 0;
        double lastLength;
        double nextLength = computeSnakeLength(snake);
        do {
            lastLength = nextLength;
            snake.tick();
            nextLength = computeSnakeLength(snake);
            ticks++;
        } while (nextLength > lastLength);

        assertTrue(ticks > 1);
        assertEquals(snake.getLength(), lastLength, config.snakes.fastSpeed);
    }

    static void tickUntilNewSnakeChunk(Snake snake, Random random) {
        final var gsc = snake.streamSnakeChunks()
                .filter(GrowingSnakeChunk.class::isInstance)
                .findFirst()
                .orElseThrow();

        while (snake.streamSnakeChunks()
                .filter(GrowingSnakeChunk.class::isInstance)
                .findFirst()
                .orElseThrow() == gsc
        ) {
            snake.tick();
            if (random.nextDouble() < 0.1) {
                snake.setTargetDirection(Direction.getRandom(random));
            }
        }
    }

    static void assertUniqueOffsets(SnakeChunk chunk) {
        final var pathData = chunk.getPathData();

        int n = pathData.stream().map(SnakePathPoint::getOffsetInChunk).collect(Collectors.toSet()).size();
        int m = pathData.stream().map(SnakePathPoint::getOffsetInSnake).collect(Collectors.toSet()).size();

        assertEquals(pathData.size(), n);
        assertEquals(n, m);
    }

    static <T> T getLastElement(List<T> list) {
        if (list.isEmpty()) {
            throw new IllegalArgumentException();
        }

        return list.get(list.size() - 1);
    }

    @Test
    void testPathDataLengthRemainsTheSame() {
        final var world = new World(config);
        final var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        tickUntilFullLength(snake);

        for (int i = 0; i < 256; i++) {
            snake.tick();
            final var length = computeSnakeLength(snake);
            assertTrue(length < snake.getLength());
            assertEquals(snake.getLength(), length, config.snakes.fastSpeed);
        }
    }

    @Test
    void testTailChunkDecreasesInLength() {
        final var random = new Random(13374242);
        final var snake = SnakeFactory.createTestSnake();
        snake.grow(64.0);
        tickUntilFullLength(snake);
        tickUntilNewSnakeChunk(snake, random);
        assertTrue(snake.getSnakeChunks().size() > 1);
        final var snakeChunks = snake.getSnakeChunks();
        final var lastSnakeChunk = snakeChunks.get(snakeChunks.size() - 1);
        assertFalse(lastSnakeChunk.isJunk());
        assertTrue(lastSnakeChunk.isFull());

        var lastOffset = lastSnakeChunk.getOffset();
        var lastSnakeChunkLength = computeSnakeChunkLength(lastSnakeChunk);
        int sameValueTicks = 0;

        while (!lastSnakeChunk.isJunk()) {
            // move snake
            snake.setTargetDirection(Direction.getRandom(random));
            snake.tick();
            assertTrue(lastOffset < lastSnakeChunk.getOffset());
            lastOffset = lastSnakeChunk.getOffset();

            final var chunkLength = computeSnakeChunkLength(lastSnakeChunk);
            assertTrue(chunkLength <= lastSnakeChunkLength);
            if (chunkLength == lastSnakeChunkLength) {
                sameValueTicks++;
            } else {
                sameValueTicks = 0;
            }

            assertTrue(sameValueTicks < 2, "Value did not change for " + sameValueTicks + " ticks.");
            lastSnakeChunkLength = chunkLength;
        }
    }

    @Test
    void testOffsetValues() {
        final var random = new Random(666137);
        final var snake = SnakeFactory.createTestSnake();
        snake.grow(64.0);
        tickUntilFullLength(snake);
        tickUntilNewSnakeChunk(snake, random);
        assertTrue(snake.getSnakeChunks().size() > 1);
        final var snakeChunks = snake.getSnakeChunks();
        final var lastSnakeChunk = getLastElement(snakeChunks);
        assertFalse(lastSnakeChunk.isJunk());
        assertTrue(lastSnakeChunk.isFull());

        final var pathData = lastSnakeChunk.getPathData();

        // test range
        for (SnakePathPoint pd : pathData) {
            final var localOffset = pd.getOffsetInChunk();
            assertTrue(0 <= localOffset);
            assertTrue(localOffset <= lastSnakeChunk.getDataLength());
        }

        assertUniqueOffsets(lastSnakeChunk);
    }

    @Test
    void testJunkChunksShouldStayJunk() {
        final var random = new Random(1234);
        final var world = new World(config);
        final var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        snake.grow(64.0);
        tickUntilFullLength(snake);
        final var lastChunk = getLastElement(snake.getSnakeChunks());
        assertFalse(lastChunk.isJunk());

        while (!lastChunk.isJunk()) {
            snake.tick();
            if (random.nextDouble() < 0.1) {
                snake.setTargetDirection(Direction.getRandom(random));
            }
        }

        snake.grow(128.0);
        snake.tick();
        assertTrue(lastChunk.isJunk());
    }

    @Test
    void testGetPositionAtMethod() {
        final var random = new Random(314159);
        final var snake = SnakeFactory.createTestSnake();
        snake.grow(64.0);
        tickUntilNewSnakeChunk(snake, random);
        assertTrue(snake.getSnakeChunks().size() > 1);

        final var snakeChunk = snake.getSnakeChunks().get(1);
        assertFalse(snakeChunk.isJunk());
        assertFalse(snakeChunk.isEmpty());

        final var startOffset = snakeChunk.getOffset();
        final var endOffset = startOffset + snakeChunk.getDataLength();

        for (var offset = startOffset; offset <= endOffset; offset += 0.05) {
            final var point = snake.getPositionAt(offset);
            assertNotNull(point);
            assertEquals(0.0, snakeChunk.getBoundingBox().distance(point), 1e-4);
        }
    }
}
