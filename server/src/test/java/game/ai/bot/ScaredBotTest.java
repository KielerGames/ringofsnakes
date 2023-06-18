package game.ai.bot;

import game.GameConfig;
import game.snake.TestSnakeFactory;
import game.world.World;
import math.Vector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ScaredBotTest {
    @Test
    void testScaredBotAvoidsOtherSnake() {
        final var config = new GameConfig();
        final var world = new World(config, false);

        final var frozenSnake = TestSnakeFactory.createSnakeFromTo(
                new Vector(0.0, 8.0),
                new Vector(0.0, 0.0),
                world
        );
        final var botSnake = TestSnakeFactory.createSnakeFromTo(
                new Vector(0.0, -12.0),
                new Vector(0.0, -4.0),
                world
        );
        final var bot = new ScaredBot(botSnake, world);

        final var travelDistance = 6.0;
        final int ticks = (int) Math.round(travelDistance / config.snakes.speed);

        for (int i = 0; i < 25; i++) {
            bot.act();
        }

        for (int i = 0; i < ticks; i++) {
            botSnake.tick();
            System.out.println(botSnake.getHeadPosition());
            bot.act();
            assertTrue(botSnake.getHeadPosition().y < frozenSnake.getHeadPosition().y);
        }
    }
}
