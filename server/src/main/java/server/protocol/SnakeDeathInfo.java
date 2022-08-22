package server.protocol;

import game.snake.Snake;

public class SnakeDeathInfo extends ServerToClientJSONMessage {
    final int deadSnakeId;
    final Integer killerSnakeId;

    public SnakeDeathInfo(Snake snake, Snake killer) {
        deadSnakeId = snake.id;
        killerSnakeId = (killer == null) ? null : ((int) killer.id);
    }
}
