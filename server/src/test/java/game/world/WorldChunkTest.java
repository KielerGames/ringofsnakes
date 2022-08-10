package game.world;

import game.snake.SnakeFactory;
import math.Vector;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.HashSet;

import static game.world.WorldChunkFactory.createChunks;
import static org.junit.jupiter.api.Assertions.*;


public class WorldChunkTest {
    final World world = new World();

    @Test
    void testNumberOfChunks() {
        int n = 4;
        int m = 4;
        var chunks = createChunks(world, 32.0, n, m);

        assertEquals(n * m, chunks.numberOfChunks());
    }

    @Test
    void testNoNulls() {
        int n = 6;
        int m = 6;
        var chunks = createChunks(world, 16.0, n, m);
        chunks.forEach(Assertions::assertNotNull);
    }

    @Test
    void testNeighbors() {
        int m = 4;
        var chunks = createChunks(world, 32.0, m, m);

        int n = chunks.numberOfChunks();

        var outerChunks = 4 * (m - 1);
        var innerChunks = n - outerChunks;
        var has8Neighbors = chunks.stream().filter(c -> c.neighbors.size() == 8).count();
        assertEquals(innerChunks, has8Neighbors);

        chunks.forEach(chunk -> {
            var neighborSet = new HashSet<>(chunk.neighbors);
            assertEquals(chunk.neighbors.size(), neighborSet.size());
        });
    }

    @Test
    void testAddASnake() {
        var world = new World();
        var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        for (int i = 0; i < 512; i++) {
            snake.tick();
        }

        world.chunks.stream()
                .filter(wc -> wc.getSnakeChunkCount() > 0)
                .findFirst()
                .orElseThrow();
    }

    @Test
    void testFindIntersectingChunks() {
        final var worldChunkSize = world.getConfig().chunks.size;
        final var originWorldChunk = world.chunks.findChunk(Vector.ORIGIN);
        final var position = originWorldChunk.box.getCenter();
        final double epsilon = 0.01;

        var worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 - epsilon);
        assertEquals(1, worldChunksInRadius.size());
        worldChunksInRadius = world.chunks.findIntersectingChunks(position, worldChunkSize / 2 + epsilon);
        assertEquals(5, worldChunksInRadius.size());
    }

    @Test
    void testSnakeHeadChunkIsAlwaysInAChunk() {
        final var snake = SnakeFactory.createTestSnake(world);

        for (int i = 0; i < 512; i++) {
            snake.tick();
            final var snakeHeadWorldChunk = world.chunks.findChunk(snake.getHeadPosition());

            assertTrue(
                    snakeHeadWorldChunk.streamSnakeChunks().anyMatch(sc -> sc == snake.currentChunk)
            );
        }
    }

    @Test
    void testSnakesWithinWorldChunk() {
        var world = new World();
        var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        for (int i = 0; i < 512; i++) {
            snake.tick();
        }

        world.chunks.stream().forEach(worldChunk -> {
            if (worldChunk.getSnakeChunkCount() > 0) {
                assertEquals(1, worldChunk.getSnakes().size());
            } else {
                assertTrue(worldChunk.getSnakes().isEmpty());
            }
        });
    }

    @Test
    void testSnakeGetsRemoved() {
        var world = new World();
        var snake = SnakeFactory.createSnake(new Vector(0, 0), world);
        snake.tick();
        var worldChunk = world.chunks.stream()
                .filter(chunk -> chunk.getSnakeChunkCount() > 0)
                .findAny()
                .orElseThrow();
        assertTrue(worldChunk.getSnakes().contains(snake));
        snake.kill();
        worldChunk.removeOldSnakeChunks();
        assertFalse(worldChunk.getSnakes().contains(snake));
        assertEquals(0, worldChunk.getSnakeChunkCount());
    }
}