package game.ai.bot;

import game.snake.BoundarySnake;
import game.snake.Snake;
import game.world.World;
import math.Direction;
import math.Vector;

class KamikazeBot extends Bot {

    private final double minKamikazeLength;
    private final double maxLookAheadDistance;
    private final double targetSelectionRadius;
    private final double minTargetLength;
    private final double oneSecondDistance;
    private int counter = random.nextInt(4) - 42;
    private Snake target;

    public KamikazeBot(World world) {
        super(world);
        final var config = world.getConfig();
        minKamikazeLength = 1.5 * config.snakes.minLength;
        minTargetLength = 2.0 * config.snakes.minLength;
        final var ticks = 10.0 + 4.0 * random.nextDouble();
        maxLookAheadDistance = ticks * config.snakes.speed;
        targetSelectionRadius = 20.0;
        oneSecondDistance = config.snakes.speed / config.tickDuration;
    }

    @Override
    public void act() {
        counter++;

        if (counter < 4) {
            return;
        }

        counter = 0;

        if (getSnake().getLength() < minKamikazeLength) {
            getSnake().setUserFast(false);
            if (random.nextDouble() < 0.3) {
                moveInRandomDirection();
            }
            return;
        }

        if (target == null) {
            target = findNextTarget();
        } else if (!target.isAlive()) {
            target = null;
        }

        kamikaze();
    }

    private void kamikaze() {
        final var snake = this.getSnake();

        if (target == null) {
            snake.setUserFast(false);
            return;
        }

        final var headPosition = snake.getHeadPosition();
        final var targetPos = target.getHeadPosition().clone();
        final var targetDirection = Direction.getFromTo(headPosition, targetPos);
        final var targetDistance2 = Vector.distance2(headPosition, target.getHeadPosition());

        final var dp = Direction.dot(target.getHeadDirection(), targetDirection);

        final var closeDistance2 = 0.5 * oneSecondDistance * oneSecondDistance;
        if (targetDistance2 < closeDistance2) {
            final var snakesMoveInSimilarDirection = Math.abs(1.0 - dp) < 0.333;

            if (snakesMoveInSimilarDirection) {
                // stop following the snake from behind
                // dot product (dp) of 1 means both snake move in the same direction
                abortMission();
                return;
            }
        }

        // when moving sideways at the target (abs(dp) = 0) move towards
        // a position in front of the target to have a chance to actually hit it
        final var lookAheadDistance = Math.min(1.0 - Math.abs(dp), 0.2) * maxLookAheadDistance;
        targetPos.addDirection(target.getHeadDirection(), lookAheadDistance);
        snake.setTargetDirection(
                Direction.getFromTo(headPosition, targetPos)
        );

        if (!snake.isFast() && random.nextBoolean()) {
            return;
        }

        snake.setUserFast(targetDistance2 < maxLookAheadDistance * maxLookAheadDistance);
    }

    /**
     * Try to find the next target snake.
     * If no suitable snake is found this method will return {@code null}.
     */
    private Snake findNextTarget() {
        final var headPosition = getSnake().getHeadPosition();
        final var otherSnakes = getSnakesInVicinity(targetSelectionRadius);

        Snake bestTarget = null;
        var lowestValue = Double.POSITIVE_INFINITY;

        for (final var otherSnake : otherSnakes) {
            if (otherSnake instanceof BoundarySnake) {
                continue;
            }

            if (otherSnake.getLength() < minTargetLength) {
                continue;
            }

            final var pos = otherSnake.getHeadPosition();
            final var w2 = otherSnake.getWidth() * otherSnake.getWidth();

            // this is the value we want to optimize
            // (reduce distance, maximize width)
            final var x = Vector.distance2(headPosition, pos) - w2;

            if (x < lowestValue) {
                bestTarget = otherSnake;
                lowestValue = x;
            }
        }

        return bestTarget;
    }

    private void abortMission() {
        final var snake = getSnake();
        if (target != null) {
            // move away from current target
            final var away = Direction.getFromTo(target.getHeadPosition(), snake.getHeadPosition());
            snake.setTargetDirection(away);
            // wait a brief moment until selecting a new target
            counter = -(int) (1.5 * oneSecondDistance);
        }
        target = null;
        snake.setUserFast(false);
    }
}
