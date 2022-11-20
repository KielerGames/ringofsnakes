package game.snake;

import game.GameConfig;
import game.world.TestGame;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SnakeCollisionTest {
    @Test
    void testParallelSnakesShouldNotCollide() {
        final var config = new GameConfig();
        final var world = new World(config, false);
        final var spawnBox = world.chunks.findChunk(Vector.ORIGIN).box;
        final var east = 0.0;
        final var offset = Math.max(0.5 * spawnBox.getHeight(), 1.5 * config.snakes.minWidth);
        final var center = spawnBox.getCenter();
        final var snake1 = TestSnakeFactory.createSnake(new Vector(center.x, center.y + 0.5 * offset), east, world);
        final var snake2 = TestSnakeFactory.createSnake(new Vector(center.x, center.y - 0.5 * offset), east, world);
        final var testGame = new TestGame(world);
        testGame.addSnake(snake1);
        testGame.addSnake(snake2);

        testGame.collisionManager.onCollisionDo((s, sc) -> {
            throw new IllegalStateException("These snakes should never collide.");
        });

        testGame.tickN(512, false);
        assertTrue(testGame.collisions.isEmpty());
    }

    @Test
    void testSimpleCollision() {
        final var config = new GameConfig();
        final var world = new World(config, false);
        final var spawnBox = world.chunks.findChunk(Vector.ORIGIN).box;
        final var offset = 5 * config.snakes.minWidth;
        final var center = spawnBox.getCenter();
        // start with parallel snakes
        final var snake1 = TestSnakeFactory.createSnake(new Vector(center.x, center.y + 0.5 * offset), 0.0, world);
        final var snake2 = TestSnakeFactory.createSnake(new Vector(center.x, center.y - 0.5 * offset), 0.0, world);
        final var testGame = new TestGame(world);
        testGame.addSnake(snake1);
        testGame.addSnake(snake2);

        // make snake 1 longer
        snake1.grow(100.0);
        testGame.tickN(16, true);
        assertTrue(testGame.collisions.isEmpty(), "Snakes should not have collided yet.");
        assertTrue(snake1.getLength() > snake2.getLength());

        // set snake2 on collision course
        snake2.setTargetDirection(0.5 * Math.PI);

        // collide
        testGame.tickN(64, true);

        assertEquals(1, testGame.collisions.size(), "Snakes should have collided.");
        final var collision = testGame.collisions.get(0);
        assertEquals(collision.snake(), snake2, "snake2 should be the colliding snake.");

        testGame.collisions.clear();
        testGame.tickN(1, true);
        assertTrue(testGame.collisions.isEmpty(), "A snake may only collide once!");
    }
}
