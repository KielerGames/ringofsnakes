package game.ai;

import game.world.World;

import java.util.Random;

public class BotFactory {
    private static final Random random = new Random();

    public static Bot createBot(World world) {
        if (random.nextDouble() < 0.33) {
            return new ScaredBot(world);
        }

        return new StupidBot(world);
    }
}
