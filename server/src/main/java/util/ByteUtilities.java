package util;

public class ByteUtilities {
    public static double toNormalizedDouble(byte b) {
        return ((int) b - Byte.MIN_VALUE) / 255.0;
    }
}
