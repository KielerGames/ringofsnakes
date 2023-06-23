package game;

import java.io.Serializable;

public final class GameConfig implements Serializable {
    public final double tickDuration = 1.0 / 25.0; // in seconds
    public final double foodNutritionalValue = 1.0;
    public final double foodConversionEfficiency = 0.5;
    public final int targetSnakePopulation = 60;
    public final boolean selfCollision = false;

    public final ChunkInfo chunks;
    public final SnakeInfo snakes;

    public GameConfig() {
        this(new ChunkInfo(32.0, 16));
    }

    public GameConfig(ChunkInfo chunkInfo) {
        this.chunks = chunkInfo;
        this.snakes = new SnakeInfo(0.3);
    }

    public static final class ChunkInfo {
        public final double size;
        public final int columns;
        public final int rows;

        public ChunkInfo(double size, int n) {
            if (size <= 0.0 || n <= 0) {
                throw new IllegalArgumentException();
            }

            this.size = size;
            columns = n;
            rows = n;
        }
    }

    public static final class SnakeInfo {
        public final double speed;
        public final double fastSpeed;
        public final double maxTurnDelta = Math.toRadians(6);
        public final double minLength = 6.0;
        public final double startLength = 8.0;
        public final double minWidth = 1.0;
        public final double maxWidth = 8.0;
        public final double burnRate = 1 / 10.0;
        public final double turnRateLimiting = 0.85;

        public SnakeInfo(double speed) {
            this.speed = speed;
            fastSpeed = 2.25 * speed;
        }
    }
}
