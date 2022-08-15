package game.snake;

import org.junit.jupiter.api.Test;

import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SnakeNameGeneratorTest {
    @Test
    void testGenerateMultipleUniqueNames() {
        final int n = 16;

        final var names = new HashSet<String>();

        for (int i = 0; i < n; i++) {
            names.add(SnakeNameGenerator.generateUnique(names));
        }

        assertEquals(n, names.size());
    }
}
