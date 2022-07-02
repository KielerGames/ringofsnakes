package server.protocol;

import game.GameConfig;
import game.snake.Snake;

public class SpawnInfo extends ServerToClientJSONMessage {
    public final GameConfig gameConfig;
    public final int snakeId;
    public final String snakeName;
    public final SnakePosition snakePosition;

    public SpawnInfo(GameConfig config, Snake snake) {
        gameConfig = config;
        snakeId = snake.id;
        assert snakeId >= 0;
        snakeName = snake.name;
        final var position = snake.getHeadPosition();
        snakePosition = new SnakePosition(position.x, position.y);
    }

    private record SnakePosition(double x, double y) {
    }
}
