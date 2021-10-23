package game;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.Collidable;
import game.world.WorldChunk;
import math.Vector;

import java.util.HashSet;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CollisionManager {
    private final Game game;
    private final boolean selfCollision;

    // see comment on onCollisionDo method
    private final Set<BiConsumer<Snake, Collidable>> collisionHandlers = new HashSet<>();

    public CollisionManager(Game game) {
        this.game = game;
        this.selfCollision = game.config.selfCollision;
    }

    private static boolean collidesWithSnakeChunk(Snake snake, SnakeChunk snakeChunk) {
        final var otherSnake = snakeChunk.getSnake();
        final var otherSnakeLength = otherSnake.getLength();
        final var radius1 = 0.5 * snake.getWidth();
        final var radius2 = 0.5 * otherSnake.getWidth();
        final var collisionBound = (radius1 + radius2) * (radius1 + radius2);
        final var headPosition = snake.getHeadPosition();

        return snakeChunk.getPathData().stream()
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
    }

    /**
     * Detect collisions for all snakes in the game.
     * Should be called once for each tick.
     */
    public void detectCollisions() {
        for (final var snake : game.snakes) {
            if (!snake.isAlive()) {
                continue;
            }

            final var snakeRadius = snake.getWidth() / 2.0;
            final var headPosition = snake.getHeadPosition();
            final var snakeChunksToConsider = getNearbySnakeChunks(snake);
            final Predicate<SnakeChunk> snakeFilter = selfCollision ?
                    (snakeChunk -> true) :
                    (snakeChunk -> !snakeChunk.getSnake().equals(snake));

            final var collidedChunk = snakeChunksToConsider.stream()
                    .filter(snakeFilter)
                    .filter(snakeChunk ->
                            snakeChunk.getBoundingBox().isWithinRange(
                                    headPosition,
                                    snakeRadius + 0.5 * snakeChunk.getSnake().getWidth()
                            )
                    )
                    .filter(snakeChunk -> collidesWithSnakeChunk(snake, snakeChunk))
                    .findAny();

            if (collidedChunk.isPresent()) {
                final var snakeChunk = collidedChunk.get();
                collisionHandlers.forEach(handler -> handler.accept(snake, snakeChunk));
            }

        }
    }

    private Set<SnakeChunk> getNearbySnakeChunks(Snake snake) {
        final var worldChunk = game.world.chunks.findChunk(snake.getHeadPosition());

        return Stream.concat(Stream.of(worldChunk), worldChunk.neighbors.stream())
                .flatMap(WorldChunk::streamSnakeChunks)
                .collect(Collectors.toSet());
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
