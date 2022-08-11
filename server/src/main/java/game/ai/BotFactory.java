package game.ai;

import game.world.World;

import java.util.Random;

public class BotFactory {
    private static final Random random = new Random();

    public static Bot createBot(World world) {
        final var p = random.nextDouble();

        if (p < 0.25) {
            return new ScaredBot(world);
        } else if (p < 0.6) {
            return new KamikazeBot(world);
        }

        return new StupidBot(world);
    }
}
