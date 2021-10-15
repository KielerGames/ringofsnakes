package util;

public class ByteUtilities {
    public static double toNormalizedDouble(byte b) {
        return ((int) b - Byte.MIN_VALUE) / 255.0;
    }

    public static byte fromNormalizedDoubleToByte(double d) {
        assert (d >= 0 && d <= 1);
        return (byte) ((d * 255.0) + Byte.MIN_VALUE);
    }
}
