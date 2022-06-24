package game;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Random;

public class NameGeneratorTest {
    @Test
    void testGenerateMultipleUniqueNames() {
        final var rand = new Random(20220624);
        final var names = new HashSet<String>();

        for (int i = 0; i < 16; i++) {
            final var uniqueName = NameGenerator.generateUnique(rand, names);
            names.add(uniqueName);
        }

        System.out.println(names);
    }
}
