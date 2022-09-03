package server.protocol;

import game.snake.Snake;
import math.Vector;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class SpectatorChange extends ServerToClientJSONMessage {
    final int targetSnakeId;
    @Nullable final Vector position;

    public SpectatorChange(Snake snake) {
        assert snake.isAlive();
        targetSnakeId = snake.id;
        position = null;
    }

    public SpectatorChange(@Nonnull Vector position) {
        targetSnakeId = 0;
        this.position = position;
    }
}
