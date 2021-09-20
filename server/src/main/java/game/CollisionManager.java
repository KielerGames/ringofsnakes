package game;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.WorldChunk;
import math.Vector;

import java.util.HashSet;
import java.util.Set;

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
        //add snakeChunks of this worldChunk
        Set<SnakeChunk> snakeChunksToConsider = new HashSet<>(wc.getSnakeChunks());
        //add snakeChunks of neighboring worldChunks
        wc.neighbors.forEach(worldChunk -> snakeChunksToConsider.addAll(worldChunk.getSnakeChunks()));
        //check for intersecting boundingBoxes
        snakeChunksToConsider.stream()
                .filter(snakeChunk -> snakeChunk.getBoundingBox()
                        .isWithinRange(s.getHeadPosition(), s.getWidth()
                                / 2.0 + snakeChunk.getSnake().getWidth() / 2.0))
                .filter(snakeChunk -> !snakeChunk.getSnake().equals(s))
                //check for actual collision between snakeHead and snakeChunk
                .forEach(snakeChunk -> checkForCollision(s, snakeChunk));
    }

    private boolean checkForCollision(Snake s, SnakeChunk sc) {
        var halfSW = s.getWidth() / 2.0;
        var halfScW = sc.getSnake().getWidth() / 2.0;
        if (sc.getPointData().stream().anyMatch(pd ->
                (Vector.distance2(s.getHeadPosition(), pd.point)) < (halfSW + halfScW) * (halfSW + halfScW))) {
            onCollision(s);
            return true;
        }
        return false;
    }

    private void onCollision(Snake s) {
        System.out.println("Collision!");
    }

}
