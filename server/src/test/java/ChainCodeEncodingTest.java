import game.ChainCodeCoder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests method encode and decode from the ChainCodeCoder Class.
 * All inputs within the specified range are initially encoded and subsequently decoded.
 * When working correctly the values should remain the same, otherwise the test fails.
 */
public class ChainCodeEncodingTest {

    ChainCodeCoder coder = new ChainCodeCoder();

    @Test
    void testAllEncodings() {
        int directions = ChainCodeCoder.DIRECTION_MASK;
        int steps = ChainCodeCoder.MAX_STEPS;

        for (int d = 0; d <= directions; d++) {
            for (int s = 1; s <= steps; s++) {
                testSpecificEncoding(d, false, s);
                testSpecificEncoding(d, true, s);
            }
        }

    }

    void testSpecificEncoding(int d, boolean f, int s) {
        byte b = coder.encode(d, f, s);
        var data = coder.decode(b);
        assertEquals(d, data.direction);
        assertEquals(f, data.fast);
        assertEquals(s, data.steps);
    }
}
