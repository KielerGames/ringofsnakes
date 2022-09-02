package server.protocol;

import game.snake.Snake;

import javax.annotation.Nullable;

public class SnakeDeathInfo extends ServerToClientJSONMessage {
    final int deadSnakeId;
    @Nullable final Integer killerSnakeId;

    public SnakeDeathInfo(Snake snake, @Nullable Snake killer) {
        deadSnakeId = snake.id;
        killerSnakeId = (killer == null) ? null : ((int) killer.id);
    }
}
