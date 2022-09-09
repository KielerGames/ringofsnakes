package server.protocol;

import game.snake.Snake;
import math.Vector;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class SpectatorChange extends ServerToClientJSONMessage {
    @Nullable final Integer targetSnakeId;
    @Nullable final Vector position;
    final boolean followSnake;

    public SpectatorChange(Snake snake) {
        assert snake.isAlive();
        targetSnakeId = (int) snake.id;
        position = null;
        followSnake = true;
    }

    public SpectatorChange(@Nonnull Vector position) {
        targetSnakeId = null;
        this.position = position;
        followSnake = false;
    }
}
