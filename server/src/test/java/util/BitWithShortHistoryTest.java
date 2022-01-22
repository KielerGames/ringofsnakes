package util;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

public class BitWithShortHistoryTest {
    @Test
    public void testCurrentValue() {
        final Random rand = new Random(314159);

        final boolean initialValue = rand.nextBoolean();
        final BitWithShortHistory bh = new BitWithShortHistory(initialValue);

        assertEquals(initialValue, bh.get());

        for (int i = 0; i < 42; i++) {
            final boolean next = rand.nextBoolean();
            bh.set(next);
            assertEquals(next, bh.get());
            assertEquals(bh.getHistory() & 0b00000001, next ? 1 : 0);
        }
    }

    @Test
    public void testHistory() {
        final Random rand = new Random(13012022);

        final BitWithShortHistory bh = new BitWithShortHistory(rand.nextBoolean());

        for (int i = 0; i < 3; i++) {
            bh.set(rand.nextBoolean());
        }

        bh.set(true);

        for (int i = 0; i < 4; i++) {
            bh.set(rand.nextBoolean());
        }

        assertNotEquals((byte) 0, bh.getHistory());

        for (int i = 0; i < 8; i++) {
            bh.set(false);
        }

        assertEquals((byte) 0, bh.getHistory());
    }
}
