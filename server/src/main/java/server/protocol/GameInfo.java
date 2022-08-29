package server.protocol;

import game.GameConfig;
import game.snake.Snake;
import math.Vector;

public class GameInfo extends ServerToClientJSONMessage {
    public final GameConfig gameConfig;
    public final int snakeId;
    public final String snakeName;
    public final Position startPosition;
    public final ClientType clientType;

    private GameInfo(ClientType clientType, Snake snake) {
        gameConfig = snake.config;
        snakeId = snake.id;
        snakeName = snake.name;
        final var position = snake.getHeadPosition();
        startPosition = new Position(position.x, position.y);
        this.clientType = clientType;
    }

    private GameInfo(GameConfig config, Vector position) {
        gameConfig = config;
        snakeId = 0;
        snakeName = null;
        startPosition = new Position(position.x, position.y);
        this.clientType = ClientType.STATIONARY_SPECTATOR;
    }

    public static GameInfo createForPlayer(Snake snake) {
        return new GameInfo(ClientType.PLAYER, snake);
    }

    public static GameInfo createForSpectator(Snake snake) {
        if (!snake.isAlive()) {
            return createForSpectator(snake.config, snake.getHeadPosition());
        }
        return new GameInfo(ClientType.SPECTATOR, snake);
    }

    public static GameInfo createForSpectator(GameConfig config, Vector position) {
        return new GameInfo(config, position);
    }

    private enum ClientType {
        PLAYER,
        SPECTATOR,
        STATIONARY_SPECTATOR
    }

    private record Position(double x, double y) {
    }
}
