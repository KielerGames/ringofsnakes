package game.ai;

import game.Game;
import game.snake.Snake;
import math.Vector;

import java.util.Random;

public class StupidBot extends Bot {

    private Random random = new Random();
    private float alpha = (float) -Math.PI;
    private int counter = 1;
    private boolean turnClockwise = true;
    private int changeDirectionAtCounter = 120;

    public StupidBot(Game game, Vector spawnPosition) {
        super(game, spawnPosition);
    }

    @Override
    public void act() {
        Snake snake = this.getSnake();
        float turningRate = (float) Math.PI / 120;

        if (!turnClockwise) {
            alpha = alpha > Math.PI ? (float) -Math.PI : alpha + turningRate;
        } else {
            alpha = alpha < -Math.PI ? (float) Math.PI : alpha - turningRate;
        }

        if (counter > changeDirectionAtCounter) {
            turnClockwise = random.nextBoolean();
            changeDirectionAtCounter = 60 + random.nextInt(120);
            counter = 0;
        }
        snake.setTargetDirection(alpha);
        counter++;
    }

}
