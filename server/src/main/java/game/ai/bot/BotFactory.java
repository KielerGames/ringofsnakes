package game.ai.bot;

import game.Game;
import game.world.World;

import java.util.LinkedList;
import java.util.List;
import java.util.Random;

public class BotFactory {

    /**
     * Creates n of the various Bot types with the type chosen
     * depending on the current bot population and the target population such that bot distribution
     * converges towards the target bot distribution
     */
    public static List<Bot> createBotsDynamically(World world, Game game, int numberOfBots) {

        final List<Bot> botList = new LinkedList<>();

        int scaredBotCount = game.countBotsOfType(ScaredBot.class);
        int kamikazeBotCount = game.countBotsOfType(KamikazeBot.class);
        int stupidBotCount = game.countBotsOfType(StupidBot.class);

        int scaredBotTargetCount = game.config.botPopulationDistributionTarget.scaredBotTarget;
        int kamikazeBotTargetCount = game.config.botPopulationDistributionTarget.kamikazeBotTarget;
        int stupidBotTargetCount = game.config.botPopulationDistributionTarget.stupidBotTarget;

        int botCount = game.getNumberOfBots();
        assert (scaredBotCount + kamikazeBotCount + stupidBotCount == botCount);

        for (int i = 0; i < numberOfBots; i++) {
            if (botCount == 0) {
                botList.add(new StupidBot(world));
                stupidBotCount++;
                botCount++;
                continue;
            }

            double scaredBotFulfilmentQuota = calculateBotQuota(scaredBotCount, scaredBotTargetCount);
            double kamikazeBotFulfilmentQuota = calculateBotQuota(kamikazeBotCount, kamikazeBotTargetCount);
            double stupidBotFulfilmentQuota = calculateBotQuota(stupidBotCount, stupidBotTargetCount);

            if (scaredBotFulfilmentQuota <= kamikazeBotFulfilmentQuota &&
                    scaredBotFulfilmentQuota <= stupidBotFulfilmentQuota) {
                botList.add(new ScaredBot(world));
                scaredBotCount++;
                botCount++;
                scaredBotFulfilmentQuota = calculateBotQuota(scaredBotCount, scaredBotTargetCount);


                System.out.println("Added scared Bot");
                System.out.println("Number of scared Bots: " + scaredBotCount);
                System.out.println("Number of Bots: " + botCount);
                System.out.println("scaredBotFulfilmentQuota: " + scaredBotFulfilmentQuota);


            } else if (kamikazeBotFulfilmentQuota <= stupidBotFulfilmentQuota &&
                    kamikazeBotFulfilmentQuota <= scaredBotFulfilmentQuota) {
                botList.add(new KamikazeBot(world));
                kamikazeBotCount++;
                botCount++;
                kamikazeBotFulfilmentQuota = calculateBotQuota(kamikazeBotCount, kamikazeBotTargetCount);

                System.out.println("Added kamikazeBot");
                System.out.println("Number of kamikaze Bots: " + kamikazeBotCount);
                System.out.println("kamikazeBotFulfilmentQuota: " + kamikazeBotFulfilmentQuota);


            } else {
                botList.add(new StupidBot(world));
                stupidBotCount++;
                botCount++;
                stupidBotFulfilmentQuota = calculateBotQuota(stupidBotCount, stupidBotTargetCount);

                System.out.println("Added stupid Bot");
                System.out.println("Number of stupid Bots: " + stupidBotCount);
                System.out.println("stupidBotFulfilmentQuota: " + stupidBotFulfilmentQuota);
            }
        }

        return botList;

    }

    private static double calculateBotQuota(int botCount, int botTargetCount){
        if (botTargetCount == 0 ){
            return 1.0;
        }
        return botCount/(double)botTargetCount;
    }


}
