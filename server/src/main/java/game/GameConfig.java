package game;

public final class GameConfig {
    public final float minLength = 5f;
    public final float burnRate = 1 / 10f;
    public final double tickDuration = 1.0 / 25.0; // in seconds
    public final double snakeSpeed;
    public final double fastSnakeSpeed;
    public final double maxTurnDelta;
    public final ChunkInfo chunkInfo;
    public final double snakeStartLength = 8.0;
    public final double snakeMinWidth = 0.5;
    public final double foodNutritionalValue = 1.0;
    public final double foodConversionEfficiency = 0.5;
    public final int targetSnakePopulation = 32;

    public GameConfig() {
        this(new ChunkInfo(32.0, 16));
    }

    public GameConfig(ChunkInfo chunkInfo) {
        this.chunkInfo = chunkInfo;

        snakeSpeed = 0.24;
        fastSnakeSpeed = 2.0 * snakeSpeed;

        // max degrees per tick
        maxTurnDelta = Math.toRadians(6);
    }

    public static class ChunkInfo {
        public final double chunkSize;
        public final int columns;
        public final int rows;

        public ChunkInfo(double size, int n) {
            if (size <= 0.0 || n <= 0) {
                throw new IllegalArgumentException();
            }

            chunkSize = size;
            columns = n;
            rows = n;
        }
    }
}
