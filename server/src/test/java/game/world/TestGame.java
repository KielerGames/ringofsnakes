package game.world;

import game.Game;
import game.GameConfig;
import game.snake.Snake;

import java.util.LinkedList;
import java.util.List;

public class TestGame extends Game {
    public final List<CollisionInfo> collisions = new LinkedList<>();

    public TestGame() {
        this(new World(new GameConfig(), false));
    }

    public TestGame(World world) {
        super(world);
        this.collisionManager.onCollisionDo((s, sc) -> collisions.add(new CollisionInfo(s, sc)));
    }

    public static TestGame createWithSmallWorld() {
        return new TestGame(new World(24.0, 3));
    }

    public void tickN(int n, boolean stopAfterCollision) {
        for (int i = 0; i < n; i++) {
            this.tick();

            if (stopAfterCollision && !collisions.isEmpty()) {
                return;
            }
        }
    }

    public void addSnake(Snake snake) {
        this.snakes.add(snake);
    }

    public record CollisionInfo(Snake snake, Collidable object) {
    }
}
