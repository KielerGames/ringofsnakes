package game.ai.bot;

import game.world.World;

import java.util.Random;

public class BotFactory {
    private static final Random random = new Random();

    public static Bot createBot(World world) {
        final var p = random.nextDouble();

        if (p < 0.1) {
            return new ScaredBot(world);
        } else if (p < 0.4) {
            return new KamikazeBot(world);
        } else if (p < 0.8) {
            return new HungryBot(world);
        }
        return new StupidBot(world);
    }
}
