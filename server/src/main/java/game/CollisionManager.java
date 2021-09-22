package game;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.WorldChunk;
import math.Vector;

import java.util.stream.Collectors;

public class CollisionManager {
    private final Game game;

    public CollisionManager(Game game) {
        this.game = game;
    }

    //should be called for each tick
    public void manageCollisions() {
        game.snakes.forEach(snake -> checkForPotentialCollisions(snake,
                game.world.chunks.findChunk(snake.getHeadPosition())));
    }

    private void checkForPotentialCollisions(Snake s, WorldChunk wc) {
        // add snakeChunks of this worldChunk
        final var snakeChunksToConsider = wc.streamSnakeChunks().collect(Collectors.toSet());
        // add snakeChunks of neighboring worldChunks
        wc.neighbors.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(snakeChunksToConsider::add);

        final var snakeRadius = s.getWidth() / 2.0;

        // check for intersecting boundingBoxes
        snakeChunksToConsider.stream()
                .filter(snakeChunk ->
                        snakeChunk.getBoundingBox().isWithinRange(
                                s.getHeadPosition(),
                                snakeRadius + 0.5 * snakeChunk.getSnake().getWidth()
                        )
                )
                .filter(snakeChunk -> !snakeChunk.getSnake().equals(s))
                // check for actual collision between snakeHead and snakeChunk
                .forEach(snakeChunk -> checkForCollision(s, snakeChunk));
    }

    private boolean checkForCollision(Snake s, SnakeChunk sc) {
        final var radius1 = s.getWidth() / 2.0;
        final var radius2 = sc.getSnake().getWidth() / 2.0;
        final var collisionBound = (radius1 + radius2) * (radius1 + radius2);

        if (sc.getPointData().stream().anyMatch(pd ->
                (Vector.distance2(s.getHeadPosition(), pd.point)) < collisionBound)) {
            onCollision(s);
            return true;
        }
        return false;
    }

    private void onCollision(Snake s) {
        System.out.println("Collision!");
    }

}
