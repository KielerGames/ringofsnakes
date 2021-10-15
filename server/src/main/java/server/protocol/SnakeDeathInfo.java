package server.protocol;

import game.snake.Snake;

public class SnakeDeathInfo extends ServerToClientJSONMessage {
    public final int snakeId;

    public SnakeDeathInfo(Snake snake) {
        snakeId = snake.id;
    }
}
