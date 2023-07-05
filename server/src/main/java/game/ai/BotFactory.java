package game.ai;

import game.Game;
import game.world.World;

import java.util.Random;

public class BotFactory {
    private static final Random random = new Random();

    public static Bot createBot(World world) {
        final var p = random.nextDouble();

        if (p < 0.25) {
            return new ScaredBot(world);
        } else if (p < 0.65) {
            return new KamikazeBot(world);
        }

        return new StupidBot(world);
    }

    /**
     * Creates one of the various Bot types with the type chosen
     * depending on the current bot population and the target population such that bot distribution
     * converges towards the target bot distribution
     *
     * @param world
     * @param game
     * @return
     */
    public static Bot createBotDynamically(World world, Game game) {

        final int scaredBotCount = game.countBotsOfType(ScaredBot.class);
        final int kamikazeBotCount = game.countBotsOfType(KamikazeBot.class);
        final int stupidBotCount = game.countBotsOfType(StupidBot.class);

        final int botCount = game.getNumberOfBots();
        assert (scaredBotCount + kamikazeBotCount + stupidBotCount == botCount);

        if (botCount == 0) {
            return new StupidBot(world);
        }

        final double scaredBotRatio = scaredBotCount / (double) botCount;
        final double kamikazeBotRatio = kamikazeBotCount / (double) botCount;
        final double stupidBotRatio = stupidBotCount / (double) botCount;

        final double scaredBotRatioDiscrepancy = game.config.botPopulationDistributionTarget.scaredBotRatio() -
                scaredBotRatio;
        final double kamikazeBotRatioDiscrepancy = game.config.botPopulationDistributionTarget.kamikazeBotRatio()
                - kamikazeBotRatio;
        final double stupidBotRatioDiscrepancy = game.config.botPopulationDistributionTarget.stupidBotRatio() -
                stupidBotRatio;

        if (scaredBotRatioDiscrepancy >= kamikazeBotRatioDiscrepancy &&
                scaredBotRatioDiscrepancy >= stupidBotRatioDiscrepancy) {
            return new ScaredBot(world);
        }

        if (kamikazeBotRatioDiscrepancy >= scaredBotRatioDiscrepancy &&
                kamikazeBotRatioDiscrepancy >= stupidBotRatioDiscrepancy) {
            return new KamikazeBot(world);
        }

        return new StupidBot(world);

    }


}
