package server.protocol;

import game.GameConfig;
import game.snake.Snake;

public class SpawnInfo extends ServerToClientJSONMessage {
    public final GameConfig gameConfig;
    public final int snakeId;
    public final String snakeName;

    public SpawnInfo(GameConfig config, Snake snake) {
        gameConfig = config;
        snakeId = snake.id;
        assert snakeId >= 0;
        snakeName = snake.name;
    }
}
