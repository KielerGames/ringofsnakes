package game.world;

import game.snake.SnakeFactory;
import math.Vector;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.HashSet;

import static game.world.WorldChunkFactory.createChunks;
import static org.junit.jupiter.api.Assertions.assertEquals;


public class WorldChunkTest {
    World world = new World();

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
        world.addSnake(snake);

        for (int i = 0; i < 512; i++) {
            snake.tick();
        }

        world.chunks.stream()
                .filter(wc -> wc.getSnakeChunkCount() > 0)
                .findFirst()
                .orElseThrow();
    }

}