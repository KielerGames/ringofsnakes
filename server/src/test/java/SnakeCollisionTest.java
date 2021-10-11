import game.Game;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

public class SnakeCollisionTest {
    @Test
    void testNoCollision() {
        final var world = new World();
        final var spawnBox = world.chunks.findChunk(Vector.ORIGIN).box;
        final var east = 0.0;
        final var offset = Math.max(0.5 * spawnBox.getHeight(), 1.5 * Snake.MIN_WIDTH);
        final var center = spawnBox.getCenter();
        final var snake1 = SnakeFactory.createSnake(new Vector(center.x, center.y + 0.5 * offset), east, world);
        final var snake2 = SnakeFactory.createSnake(new Vector(center.x, center.y - 0.5 * offset), east, world);
        final var testGame = new TestGame();
        testGame.snakes.add(snake1);
        testGame.snakes.add(snake2);

        testGame.collisionManager.onCollisionDo((s, sc) -> {
            throw new IllegalStateException("These snakes should never collide.");
        });

        testGame.tickN(512);
    }

    private static class TestGame extends Game {
        public void tickN(int n) {
            for (int i = 0; i < n; i++) {
                this.tick();
            }
        }
    }
}
