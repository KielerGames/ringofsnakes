package game.snake;

import game.snake.SnakeNameGenerator;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SnakeNameGeneratorTest {
    @Test
    void testGenerateMultipleUniqueNames() {
        final int n = 16;

        final var rand = new Random(20220624);
        final var names = new HashSet<String>();

        for (int i = 0; i < n; i++) {
            names.add(SnakeNameGenerator.generateUnique(names));
        }

        assertEquals(n, names.size());
    }
}
