package game;

public final class GameConfig {
    public final double snakeSpeed;
    public final double fastSnakeSpeed;
    public final double maxTurnDelta;

    public GameConfig() {
        snakeSpeed = 0.24;
        fastSnakeSpeed = 1.25 * snakeSpeed;

        // 2deg -> 3sec for a full 360deg rotation
        maxTurnDelta = Math.toRadians(5);

    }
}
