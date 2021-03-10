package game;

public final class GameConfig {
    public final double snakeSpeed;
    public final double fastSnakeSpeed;
    public final double maxTurnDelta;
    public final boolean selfCollision = false;

    public GameConfig() {
        snakeSpeed = 0.24;
        fastSnakeSpeed = 2.0 * snakeSpeed;

        // max degrees per tick
        maxTurnDelta = Math.toRadians(6);
    }
}
