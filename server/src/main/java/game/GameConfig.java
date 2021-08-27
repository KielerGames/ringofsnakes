package game;

public final class GameConfig {
    public final float minLength = 3f;
    public final float burnRate = 1 / 10f;
    public final double tickDuration = 1.0 / 25.0; // in seconds
    public final double snakeSpeed;
    public final double fastSnakeSpeed;
    public final double maxTurnDelta;
    public final ChunkInfo chunkInfo;

    public GameConfig() {
        snakeSpeed = 0.24;
        fastSnakeSpeed = 2.0 * snakeSpeed;

        // max degrees per tick
        maxTurnDelta = Math.toRadians(6);

        chunkInfo = new ChunkInfo(32.0, 16);
    }

    public static class ChunkInfo {
        public final double chunkSize;
        public final int columns;
        public final int rows;

        ChunkInfo(double size, int n) {
            if(size <= 0.0 || n <= 0) {
                throw new IllegalArgumentException();
            }

            chunkSize = size;
            columns = n;
            rows = n;
        }
    }
}
