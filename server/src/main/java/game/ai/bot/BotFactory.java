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

        double scaredBotTargetCount = game.config.botPopulationDistributionTarget.scaredBotTarget;
        double kamikazeBotTargetCount = game.config.botPopulationDistributionTarget.kamikazeBotTarget;
        double stupidBotTargetCount = game.config.botPopulationDistributionTarget.stupidBotTarget;

        int botCount = game.getNumberOfBots();
        assert (scaredBotCount + kamikazeBotCount + stupidBotCount == botCount);

        //I know, I know...but it should work and avoid division by Zero if a target is 0.
        if (scaredBotTargetCount == 0) {scaredBotTargetCount = 0.1;}
        if (kamikazeBotTargetCount == 0) {kamikazeBotTargetCount = 0.1;}
        if(stupidBotTargetCount == 0){stupidBotTargetCount = 0.1;}


        for (int i = 0; i < numberOfBots; i++) {
            if (botCount == 0) {
                botList.add(new StupidBot(world));
                stupidBotCount++;
                botCount++;
                continue;
            }

            double scaredBotFulfilmentQuota = scaredBotCount / scaredBotTargetCount;
            double kamikazeBotFulfilmentQuota = kamikazeBotCount / kamikazeBotTargetCount;
            double stupidBotFulfilmentQuota = stupidBotCount / stupidBotTargetCount;

            if (scaredBotFulfilmentQuota <= kamikazeBotFulfilmentQuota &&
                    scaredBotFulfilmentQuota <= stupidBotFulfilmentQuota) {
                botList.add(new ScaredBot(world));
                scaredBotCount++;
                botCount++;
                scaredBotFulfilmentQuota = scaredBotCount / scaredBotTargetCount;


                System.out.println("Added scared Bot");
                System.out.println("Number of scared Bots: " + scaredBotCount);
                System.out.println("Number of Bots: " + botCount);
                System.out.println("scaredBotFulfilmentQuota: " + scaredBotFulfilmentQuota);


            } else if (kamikazeBotFulfilmentQuota <= stupidBotFulfilmentQuota &&
                    kamikazeBotFulfilmentQuota <= scaredBotFulfilmentQuota) {
                botList.add(new KamikazeBot(world));
                kamikazeBotCount++;
                botCount++;
                kamikazeBotFulfilmentQuota = kamikazeBotCount / kamikazeBotTargetCount;

                System.out.println("Added kamikazeBot");
                System.out.println("Number of kamikaze Bots: " + kamikazeBotCount);
                System.out.println("kamikazeBotFulfilmentQuota: " + kamikazeBotFulfilmentQuota);


            } else {
                botList.add(new StupidBot(world));
                stupidBotCount++;
                botCount++;
                stupidBotFulfilmentQuota = stupidBotCount / stupidBotTargetCount;

                System.out.println("Added stupid Bot");
                System.out.println("Number of stupid Bots: " + stupidBotCount);
                System.out.println("stupidBotFulfilmentQuota: " + stupidBotFulfilmentQuota);
            }
        }

        return botList;

    }


}
