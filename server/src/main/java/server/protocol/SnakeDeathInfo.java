package server.protocol;

import game.snake.Snake;

import javax.annotation.Nullable;

public class SnakeDeathInfo extends ServerToClientJSONMessage {
    @Nullable public final transient Snake killer;
    final int deadSnakeId;
    @Nullable final Integer killerSnakeId;

    public SnakeDeathInfo(Snake snake, @Nullable Snake killer) {
        deadSnakeId = snake.id;
        this.killer = killer;
        killerSnakeId = (killer == null) ? null : ((int) killer.id);
    }
}
