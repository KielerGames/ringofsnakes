package game.ai;

import game.Game;
import game.snake.Snake;
import game.world.World;
import math.Vector;
import util.Direction;

import java.util.Random;

public class StupidBot extends Bot {

    private final static Random random = new Random();
    private final double keepThisDistanceToMapEdge = 40;
    private final World world;
    private final int takeThisNumberOfStepsTowardsCenter = 150;
    private boolean turnClockwise = true;
    private boolean movingToPosition = false;
    private int counter = 1;
    private int changeDirectionAtCounter = 120;
    private int stepsTakenTowardsPositions = 0; //a "step" is a call of act()
    private double alpha = -Math.PI;
    private double turningRate = Math.PI / 120;

    public StupidBot(Game game, Vector spawnPosition) {
        super(game, spawnPosition);
        this.world = game.world;
    }

    @Override
    public void act() {
        final var snake = this.getSnake();

        if (!world.box.isWithinSubBox(snake.getHeadPosition(), keepThisDistanceToMapEdge)
                && !movingToPosition) {
            moveTowardsPosition(snake, world.center);
            stepsTakenTowardsPositions = 0;
        }

        if (movingToPosition) {
            stepsTakenTowardsPositions++;
            if (stepsTakenTowardsPositions > takeThisNumberOfStepsTowardsCenter) {
                movingToPosition = false;
                stepsTakenTowardsPositions = 0;
            }
            return;
        }

        alpha = Direction.normalize(turnClockwise ? alpha - turningRate : alpha + turningRate);

        if (counter > changeDirectionAtCounter) {
            turnClockwise = random.nextBoolean();
            turningRate = Math.PI / 60 * random.nextFloat();
            changeDirectionAtCounter = 60 + random.nextInt(120);
            counter = 0;
        }
        snake.setTargetDirection(alpha);
        counter++;
    }

    private void moveTowardsPosition(Snake snake, Vector targetPosition) {
        this.movingToPosition = true;
        final var targetDirection = determineTargetDirection(snake.getHeadPosition(), targetPosition);
        final var directionAlpha = Math.atan2(targetDirection.y, targetDirection.x);
        snake.setTargetDirection(directionAlpha);
    }

    private Vector determineTargetDirection(Vector headPosition, Vector targetPosition) {
        final var direction = targetPosition.clone();
        direction.addScaled(headPosition, -1);
        direction.normalize();
        return direction;
    }

}
