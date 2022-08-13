package game.ai;

import game.world.World;
import math.Vector;
import util.Direction;

class StupidBot extends Bot {
    private static final double keepThisDistanceToMapEdge = 40;
    private static final int takeThisNumberOfStepsTowardsCenter = 150;
    private boolean turnClockwise = true;
    private boolean movingToPosition = false;
    private int counter = 1;
    private int changeDirectionAtCounter = 120;
    private int stepsTakenTowardsPositions = 0; //a "step" is a call of act()
    private double alpha = Direction.LEFT;
    private double turningRate = Math.PI / 120;

    StupidBot(World world) {
        super(world);
    }

    @Override
    public void act() {
        final var snake = this.getSnake();

        if (!world.box.isWithinSubBox(snake.getHeadPosition(), keepThisDistanceToMapEdge)
                && !movingToPosition) {
            moveTowardsPosition(world.center);
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
            turningRate = Math.PI / 60 * random.nextDouble();
            changeDirectionAtCounter = 60 + random.nextInt(120);
            counter = 0;
        }
        snake.setTargetDirection(alpha);
        counter++;
    }

    @Override
    protected void moveTowardsPosition(Vector targetPosition) {
        super.moveTowardsPosition(targetPosition);
        this.movingToPosition = true;
    }
}
