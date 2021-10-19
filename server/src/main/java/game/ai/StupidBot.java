package game.ai;

import game.Game;
import game.snake.Snake;
import math.Vector;

import java.util.Random;

public class StupidBot extends Bot {

    private final static Random random = new Random();
    private final double keepThisDistanceToMapEdge = 40;

    private boolean turnClockwise = true;
    private boolean movingToPosition = false;

    private int counter = 1;
    private int changeDirectionAtCounter = 120;
    private int stepsTakenTowardsPositions = 0; //a "step" is a call of act()

    private float alpha = (float) -Math.PI;

    public StupidBot(Game game, Vector spawnPosition) {
        super(game, spawnPosition);
    }

    @Override
    public void act() {
        final var snake = this.getSnake();
        final var turningRate = (float) Math.PI / 120;

        if (Math.abs(snake.getHeadPosition().x) > getWorldWidth() / 2.0 - keepThisDistanceToMapEdge
                || (Math.abs(snake.getHeadPosition().y) > getWorldHeight() / 2.0 - keepThisDistanceToMapEdge)) {
            moveTowardsPosition(snake, new Vector(0, 0));
            movingToPosition = true;
        }

        if (movingToPosition) {
            stepsTakenTowardsPositions++;
            if (stepsTakenTowardsPositions > 50) {
                movingToPosition = false;
                stepsTakenTowardsPositions = 0;
            }
            return;
        }

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

    private void moveTowardsPosition(Snake snake, Vector targetPosition) {
        if (!this.movingToPosition) {
            final var targetDirection = determineTargetDirection(snake.getHeadPosition(), targetPosition);
            final var directionAlpha = (float) Math.atan2(targetDirection.y, targetDirection.x);
            snake.setTargetDirection(directionAlpha);
        }
    }

    private Vector determineTargetDirection(Vector headPosition, Vector targetPosition) {
        final var direction = targetPosition.clone();
        direction.addScaled(headPosition, -1);
        direction.normalize();
        return direction;
    }

}
