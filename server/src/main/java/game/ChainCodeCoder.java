package game;

public class ChainCodeCoder {
    // 2deg -> 3sec for a full 360deg rotation
    private final double MAX_DELTA = Math.PI / 90; // 2deg
    private static final int FAST_BIT = 1<<7;
    private static final int STEPS_MASK = 7<<4;
    private static final int DIRECTION_MASK = 15;

    /**
     * Encoding f,s,s,s,d,d,d,d
     * f: fast bit, s: steps, d: direction
     * @return data encoded in 8 bits
     */
    public byte encode(int direction, boolean fast, int steps) {
        assert 0<steps && steps <= 8;

        // encode steps
        int stepBits = (steps-1) << 4;

        // encode everything into a 8 bit
        int data = stepBits | direction;
        if(fast) {
            data |= FAST_BIT;
        }

        return (byte) data;
    }

    public int sampleDirection(double newAngle, double oldAngle) {
        // transform to [0, 2*PI]
        newAngle += Math.PI;
        oldAngle += Math.PI;

        // compute change
        double delta = newAngle - oldAngle;

        // normalize change s.t. delta is in [-PI,PI]
        if(Math.abs(delta) > Math.PI) {
            delta -= Math.signum(delta) * 2.0 * Math.PI;
        }
        assert Math.abs(delta) <= Math.PI;
        assert Math.abs(delta) <= MAX_DELTA + 1e-8 : "angle diff too big!";

        // angle sampling [0,15]
        int k = (byte) Math.round((7 * delta) / MAX_DELTA);
        return 2*Math.abs(k) + (k < 0 ? 1 : 0);
    }

    public double decodeDirection(int direction) {
        int sign = 1 - ((direction & 1)<<1);
        int k = sign * (direction/2);
        return k * MAX_DELTA / 7.0;
    }

    public DecodedData decode(byte b) {
        boolean fast = (b & FAST_BIT) > 0;
        int steps = 1 + ((b & STEPS_MASK)>>4);
        int direction = b & DIRECTION_MASK;
        return new DecodedData(direction, fast, steps);
    }
}

class DecodedData {
    public int direction;
    public boolean fast;
    public int steps;

    DecodedData(int direction, boolean fast, int steps) {
        this.direction = direction;
        this.fast = fast;
        this.steps = steps;
    }
}
