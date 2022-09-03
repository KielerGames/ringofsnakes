package server.protocol;

import game.GameConfig;
import game.snake.Snake;

public class GameInfo extends ServerToClientJSONMessage {
    public final GameConfig gameConfig;
    public final int snakeId;
    public final String snakeName;
    public final Position startPosition;

    private GameInfo(Snake snake) {
        gameConfig = snake.config;
        snakeId = snake.id;
        snakeName = snake.name;
        final var position = snake.getHeadPosition();
        startPosition = new Position(position.x, position.y);
    }

    private record Position(double x, double y) {
    }
}
