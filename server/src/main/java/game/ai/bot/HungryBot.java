package game.ai.bot;

import game.ai.behavior.FoodSeekingBehavior;
import game.ai.behavior.InputSuggestion;
import game.world.World;

public class HungryBot extends Bot {
    private int counter = 0;

    public HungryBot(World world) {
        super(world);
    }

    @Override
    public void act() {
        counter++;

        if (counter < 4) {
            return;
        }

        counter = 0;

        final var snake = getSnake();

        InputSuggestion inputSuggestion = FoodSeekingBehavior.computeInputSuggestion(snake);
        snake.setTargetDirection(inputSuggestion.direction());
        snake.setUserFast(inputSuggestion.boost());
    }
}
