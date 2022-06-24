package game;

import java.util.Arrays;
import java.util.Random;
import java.util.Set;

public class NameGenerator {

    private static final String[] prefixes = {
            "Another", "Big", "One", "Super", "The", "Ultra"
    };
    private static final String[] adjectives = {
            "Abnormal", "Aimless", "Alien", "Alpha", "Amazing", "Angry",
            "Annoying", "Apt", "Armless", "Average", "Bad", "Baffling", "Bare",
            "Basic", "Bitter", "Busy", "Capable", "Chunky", "Clumsy", "Crawling",
            "Crazy", "Dangerous", "Deadly", "Diabolic", "Dizzy", "Eager", "Elite",
            "Emo", "Evil", "Exotic", "Fabulous", "Fake", "Fancy", "Fast", "Fatal",
            "Fatal", "Fierce", "Flailing", "Foolish", "Frisky", "Furious", "Giddy",
            "Goofy", "Grand", "Great", "Greedy", "Grim", "Hasty", "Hateful",
            "Heavy", "Huge", "Hungry", "Iconic", "Lazy", "Long", "Lucky", "Mad",
            "Magnificent", "Massive", "Mighty", "Mystic", "Nasty", "Nervous",
            "Noble", "Quick", "Raging", "Savage", "Scaly", "Silly", "Slithering",
            "Slow", "Sly", "Snaky", "Sneaky", "Speedy", "Tremendous", "Turbo",
            "Twisted", "Undercover", "Unscrupulous", "Venomous", "Vicious", "Wild"
    };

    private static final String[] nouns = {
            "Adder", "Anaconda", "Animal", "Basilisk", "Cobra", "Colubrid",
            "Constrictor", "Crawler", "Creature", "Danger", "Guy", "Joker", "Line",
            "Maggot", "Mamba", "Monster", "Noodle", "Python", "Reptile", "Serpent",
            "Snake", "Snek", "Specimen", "Tube", "Villain", "Viper", "Wire", "Worm"
    };

    private NameGenerator() {

    }

    private static String generate(Random rand) {
        final var adjective = adjectives[rand.nextInt(adjectives.length)];
        final var noun = nouns[rand.nextInt(nouns.length)];
        final var name = adjective + noun;

        if (name.length() >= 15) {
            return name;
        }

        if (name.length() >= 10 && rand.nextBoolean()) {
            return name;
        }

        final var ps = Arrays.stream(prefixes)
                .filter(p -> p.length() + name.length() < 20)
                .toList();

        final var prefix = ps.get(rand.nextInt(ps.size()));
        return prefix + name;
    }

    /**
     * Create a new snake name that is not in the given set.
     */
    public static String generateUnique(Random rand, Set<String> usedNames) {
        int attempts = 0;
        String name;

        do {
            attempts++;
            name = generate(rand);

            if (!usedNames.contains(name)) {
                return name;
            }
        } while (attempts < 10);

        final int n = rand.nextInt(100, 1000);
        return name + n;
    }
}
