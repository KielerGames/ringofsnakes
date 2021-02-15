package game;

public final class GameConfig {
    public final double snakeSpeed;
    public final double fastSnakeSpeed;
    public final double maxTurnDelta;

    public GameConfig() {
        snakeSpeed = 0.2;
        fastSnakeSpeed = 0.25;

        // 2deg -> 3sec for a full 360deg rotation
        maxTurnDelta = Math.PI / 90; // 2deg
    }
}
