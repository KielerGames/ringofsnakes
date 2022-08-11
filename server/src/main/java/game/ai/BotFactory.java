package game.ai;

import game.world.World;

import java.util.Random;

public class BotFactory {
    private static final Random random = new Random();

    public static Bot createBot(World world) {
        final var spawnPosition = world.findSpawnPosition();

        if (random.nextDouble() < 0.25) {
            return new ScaredBot(world, spawnPosition);
        }

        return new StupidBot(world, spawnPosition);
    }
}
