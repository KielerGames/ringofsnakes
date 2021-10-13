import game.Game;
import game.GameConfig;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SnakeCollisionTest {
    @Test
    void testParallelSnakesShouldNotCollide() {
        final var config = new GameConfig();
        final var world = new World(config);
        final var spawnBox = world.chunks.findChunk(Vector.ORIGIN).box;
        final var east = 0.0;
        final var offset = Math.max(0.5 * spawnBox.getHeight(), 1.5 * Snake.MIN_WIDTH);
        final var center = spawnBox.getCenter();
        final var snake1 = SnakeFactory.createSnake(new Vector(center.x, center.y + 0.5 * offset), east, world);
        final var snake2 = SnakeFactory.createSnake(new Vector(center.x, center.y - 0.5 * offset), east, world);
        final var testGame = new TestGame(config, world);
        testGame.snakes.add(snake1);
        testGame.snakes.add(snake2);

        testGame.collisionManager.onCollisionDo((s, sc) -> {
            throw new IllegalStateException("These snakes should never collide.");
        });

        testGame.tickN(512, false);
        assertTrue(testGame.collisions.isEmpty());
    }

    @Test
    void testSimpleCollision() {
        final var config = new GameConfig();
        final var world = new World(config);
        final var spawnBox = world.chunks.findChunk(Vector.ORIGIN).box;
        final var offset = 5 * Snake.MIN_WIDTH;
        final var center = spawnBox.getCenter();
        // start with parallel snakes
        final var snake1 = SnakeFactory.createSnake(new Vector(center.x, center.y + 0.5 * offset), 0.0, world);
        final var snake2 = SnakeFactory.createSnake(new Vector(center.x, center.y - 0.5 * offset), 0.0, world);
        final var testGame = new TestGame(config, world);
        testGame.snakes.add(snake1);
        testGame.snakes.add(snake2);

        // make snake 1 longer
        snake1.grow(100.0);
        testGame.tickN(16, true);
        assertTrue(testGame.collisions.isEmpty(), "Snakes should not have collided yet.");
        assertTrue(snake1.getLength() > snake2.getLength());

        // set snake2 on collision course
        snake2.setTargetDirection((float) (0.5 * Math.PI));

        // collide
        testGame.tickN(64, true);

        assertFalse(testGame.collisions.isEmpty(), "Snakes should have collided.");
        final var collision = testGame.collisions.get(0);
        assertEquals(collision.snake, snake2, "snake2 should be the colliding snake.");
    }

    private static class TestGame extends Game {
        public final List<CollisionInfo> collisions = new LinkedList<>();

        public TestGame(GameConfig config, World world) {
            super(config, world);
            this.collisionManager.onCollisionDo((s, sc) -> collisions.add(new CollisionInfo(s, sc)));
        }

        public void tickN(int n, boolean stopAfterCollision) {
            for (int i = 0; i < n; i++) {
                this.tick();

                if (stopAfterCollision && !collisions.isEmpty()) {
                    return;
                }
            }
        }
    }

    private static class CollisionInfo {
        public final Snake snake;
        public final SnakeChunk chunk;

        public CollisionInfo(Snake snake, SnakeChunk chunk) {
            this.snake = snake;
            this.chunk = chunk;
        }
    }
}