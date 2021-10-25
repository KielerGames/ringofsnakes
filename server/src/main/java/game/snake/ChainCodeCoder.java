package game.snake;

import game.GameConfig;

import static util.NumberUtilities.clamp;

public class ChainCodeCoder {
    public static final int STEPS_MASK = 7 << 4;
    public static final int DIRECTION_MASK = 15;
    public static final int MAX_STEPS = 8;
    private static final int FAST_BIT = 1 << 7;
    private static final double SCALE_RANGE = 6.0/7.0 - Double.MIN_NORMAL;

    private final GameConfig config;
    private final Snake snake;
    private final double DIR_STEP;
    private final double INV_MAX_DELTA;

    public ChainCodeCoder(Snake snake) {
        this.snake = snake;
        this.config = snake.config;
        DIR_STEP = config.snakes.maxTurnDelta / 7.0;
        INV_MAX_DELTA = 1.0 / config.snakes.maxTurnDelta;
    }

    private double getMaxTurnDelta() {
        final var width = snake.getWidth();

        // x in [0, 1] (relative width)
        final var x = (width - config.snakes.minWidth) / (config.snakes.maxWidth - config.snakes.minWidth);

        // scale in [1/7, 1]
        final var scale = 1.0 - SCALE_RANGE * x;

        return scale * config.snakes.maxTurnDelta;
    }

    /**
     * Encoding f,s,s,s,d,d,d,d
     * f: fast bit, s: steps, d: direction
     *
     * @return data encoded in 8 bits
     */
    public byte encode(int direction, boolean fast, int steps) {
        assert 0 < steps && steps <= MAX_STEPS;

        // encode steps
        int stepBits = (steps - 1) << 4;

        // encode everything into 8 bit
        int data = stepBits | direction;
        if (fast) {
            data |= FAST_BIT;
        }

        return (byte) data;
    }

    public int sampleDirectionChange(double newAngle, double oldAngle) {
        // compute change
        double delta = newAngle - oldAngle;

        // normalize change s.t. delta is in [-PI,PI]
        if (Math.abs(delta) > Math.PI) {
            delta -= Math.signum(delta) * 2.0 * Math.PI;
        }
        assert Math.abs(delta) <= Math.PI;

        final double maxDelta = getMaxTurnDelta();
        delta = clamp(delta, -maxDelta, maxDelta);

        // angle sampling [0,15]
        int k = (byte) Math.round((7 * delta) * INV_MAX_DELTA);
        return 2 * Math.abs(k) + (k < 0 ? 1 : 0);
    }

    public double decodeDirectionChange(int direction) {
        int sign = 1 - ((direction & 1) << 1);
        int k = sign * (direction / 2);
        return k * DIR_STEP;
    }

    public DecodedData decode(byte b) {
        boolean fast = (b & FAST_BIT) > 0;
        int steps = 1 + ((b & STEPS_MASK) >> 4);
        int direction = b & DIRECTION_MASK;
        return new DecodedData(direction, fast, steps);
    }

    public static class DecodedData {
        public final int direction;
        public final boolean fast;
        public final int steps;

        DecodedData(int direction, boolean fast, int steps) {
            this.direction = direction;
            this.fast = fast;
            this.steps = steps;
        }

        @Override
        public String toString() {
            String s = "";
            s += "fast: " + this.fast + "\n";
            s += "steps: " + this.steps + "\n";
            s += "direction: " + this.direction + "\n";
            return s;
        }
    }
}


