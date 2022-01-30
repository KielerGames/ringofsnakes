package util;

public class BitWithShortHistory {
    private static final byte MASK = (byte) 0b11111110;
    private boolean current;
    private byte history = 0;

    public BitWithShortHistory(boolean initialValue) {
        set(initialValue);
    }

    /**
     * Set the current value.
     */
    public void set(boolean value) {
        current = value;
        history = (byte) ((history << 1) | (value ? 1 : 0));
    }

    /**
     * Update the current value without creating a new history entry.
     */
    public void replace(boolean value) {
        current = value;
        history = (byte) ((history & MASK) | (value ? 1 : 0));
    }

    /**
     * Get the current value.
     */
    public boolean get() {
        return current;
    }

    /**
     * Getter for previous values.
     * {@code get(0)} returns the current value, {@code get(1)} the one before that.
     */
    public boolean get(int i) {
        return (history & (1 << i)) != 0;
    }

    /**
     * Get the history of values. The least significant bit is the current value.
     */
    public byte getHistory() {
        return history;
    }
}
