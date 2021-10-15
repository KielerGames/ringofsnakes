package game;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.Collidable;
import game.world.WorldChunk;
import math.Vector;

import java.util.HashSet;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

public class CollisionManager {
    private final Game game;

    // see comment on onCollisionDo method
    private final Set<BiConsumer<Snake, Collidable>> collisionHandlers = new HashSet<>();

    public CollisionManager(Game game) {
        this.game = game;
    }

    /**
     * Detect collisions for all snakes in the game.
     * Should be called once for each tick.
     */
    public void detectCollisions() {
        game.snakes.forEach(snake -> checkForPotentialCollisions(snake,
                game.world.chunks.findChunk(snake.getHeadPosition())));
    }

    private void checkForPotentialCollisions(Snake s, WorldChunk wc) {
        // add snakeChunks of this worldChunk
        final var snakeChunksToConsider = wc.streamSnakeChunks().collect(Collectors.toSet());
        // add snakeChunks of neighboring worldChunks
        wc.neighbors.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(snakeChunksToConsider::add);

        final var snakeRadius = s.getMaxWidth() / 2.0;

        // check for intersecting boundingBoxes
        snakeChunksToConsider.stream()
                .filter(snakeChunk ->
                        snakeChunk.getBoundingBox().isWithinRange(
                                s.getHeadPosition(),
                                snakeRadius + 0.5 * snakeChunk.getSnake().getMaxWidth()
                        )
                )
                .filter(snakeChunk -> !snakeChunk.getSnake().equals(s))
                // check for actual collision between snakeHead and snakeChunk
                .forEach(snakeChunk -> checkForCollision(s, snakeChunk));
    }

    private void checkForCollision(Snake snake, SnakeChunk snakeChunk) {
        final var otherSnake = snakeChunk.getSnake();
        final var otherSnakeLength = otherSnake.getLength();
        final var radius1 = 0.5 * snake.getMaxWidth();
        final var radius2 = 0.5 * otherSnake.getMaxWidth();
        final var collisionBound = (radius1 + radius2) * (radius1 + radius2);
        final var headPosition = snake.getHeadPosition();

        final var collidesWithChunk = snakeChunk.getPathData().stream()
                .filter(pd -> pd.getOffsetInSnake() < otherSnakeLength)
                .filter(pd -> Vector.distance2(headPosition, pd.point) < collisionBound)
                .anyMatch(pd -> {
                    final var width = pd.getSnakeWidth();

                    if (width < 1e-4) {
                        // no collision if the snake is very thin
                        return false;
                    }

                    final var r2 = 0.5 * width;
                    final var bound = (radius1 + r2) * (radius1 + r2);
                    return Vector.distance2(headPosition, pd.point) < bound;
                });

        if (collidesWithChunk) {
            collisionHandlers.forEach(handler -> handler.accept(snake, snakeChunk));
        }
    }

    /**
     * Add a collision handler. For example
     * {@code onCollisionDo((snake, chunk) -> System.out.println(snake.id + " collided".)); }
     * If multiple collision handler are registered all of them will be called sequentially.
     *
     * @param handler A function that gets called for each collision.
     */
    public void onCollisionDo(BiConsumer<Snake, Collidable> handler) {
        collisionHandlers.add(handler);
    }

}
