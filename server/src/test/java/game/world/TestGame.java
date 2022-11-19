package game.world;

import game.Game;
import game.GameConfig;
import game.snake.Snake;

import java.util.LinkedList;
import java.util.List;

public class TestGame extends Game {
    public final List<CollisionInfo> collisions = new LinkedList<>();

    public TestGame() {
        super(new GameConfig());
    }

    public TestGame(World world) {
        super(world);
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

    public record CollisionInfo(Snake snake, Collidable object) {
    }
}
