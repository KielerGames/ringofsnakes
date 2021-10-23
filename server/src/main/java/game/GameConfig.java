package game;

public final class GameConfig {
    public final double tickDuration = 1.0 / 25.0; // in seconds
    public final double foodNutritionalValue = 1.0;
    public final double foodConversionEfficiency = 0.5;
    public final int targetSnakePopulation = 32;

    public final ChunkInfo chunk;
    public final SnakeInfo snake;

    public GameConfig() {
        this(new ChunkInfo(32.0, 16));
    }

    public GameConfig(ChunkInfo chunkInfo) {
        this.chunk = chunkInfo;
        this.snake = new SnakeInfo(0.24);
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

    public static class SnakeInfo {
        public final double speed;
        public final double fastSpeed;
        public final double maxTurnDelta = Math.toRadians(6);
        public final float minLength = 6f;
        public final double startLength = 8.0;
        public final double minWidth = 0.5;
        public final double burnRate = 1 / 10f;

        public SnakeInfo(double speed) {
            this.speed = speed;
            fastSpeed = 2.0 * speed;
        }
    }
}
