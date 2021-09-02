import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static util.ByteUtilities.toNormalizedDouble;

public class UtilTest {
    @Test
    void testByteToNormalizedDoubleBound() {
        assertEquals(1.0, toNormalizedDouble(Byte.MAX_VALUE));
        assertEquals(0.0, toNormalizedDouble(Byte.MIN_VALUE));
    }

    @Test
    void testByteToNormalizedDoubleMiddle() {
        assertEquals(0.5, toNormalizedDouble((byte) 0), 1.0 / 256);
    }
}
