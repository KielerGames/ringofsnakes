package server.protocol;

import game.GameConfig;
import game.snake.Snake;

public class SpawnInfo extends ServerToClientJSONMessage {
    public final GameConfig gameConfig;
    public final int snakeId;

    public SpawnInfo(GameConfig config, Snake snake) {
        gameConfig = config;
        snakeId = snake.id;
    }
}
