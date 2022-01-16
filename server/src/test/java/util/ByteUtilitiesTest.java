package util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static util.ByteUtilities.fromNormalizedDoubleToByte;
import static util.ByteUtilities.toNormalizedDouble;

public class ByteUtilitiesTest {
    @Test
    void testByteToNormalizedDoubleBound() {
        assertEquals(1.0, toNormalizedDouble(Byte.MAX_VALUE));
        assertEquals(0.0, toNormalizedDouble(Byte.MIN_VALUE));
    }

    @Test
    void testByteToNormalizedDoubleMiddle() {
        assertEquals(0.5, toNormalizedDouble((byte) 0), 1.0 / 256);
    }

    @Test
    void testFromNormalizedDoubleToByte() {
        assertEquals(Byte.MAX_VALUE, fromNormalizedDoubleToByte(1.0));
        assertEquals(Byte.MIN_VALUE, fromNormalizedDoubleToByte(0));
    }
}
