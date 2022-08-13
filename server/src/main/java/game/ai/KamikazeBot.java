package game.ai;

import game.snake.BoundarySnake;
import game.snake.Snake;
import game.world.World;
import math.Vector;
import util.Direction;

class KamikazeBot extends Bot {

    private final double minKamikazeLength;
    private final double lookAheadDistance;
    private final double targetSelectionRadius;
    private int counter = random.nextInt(4) - 42;
    private Snake target;

    public KamikazeBot(World world) {
        super(world);
        final var config = world.getConfig();
        minKamikazeLength = 1.5 * config.snakes.minLength;
        final double ticks = 8.0 + 4.0 * random.nextDouble();
        lookAheadDistance = ticks * config.snakes.speed;
        targetSelectionRadius = 28.0;
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

        final var pos = target.getHeadPosition().clone();
        pos.addDirection(target.getHeadDirection(), lookAheadDistance);

        snake.setTargetDirection(
                Direction.getFromTo(headPosition, pos)
        );

        if (!snake.isFast() && random.nextBoolean()) {
            return;
        }

        final var distance2 = Vector.distance2(headPosition, target.getHeadPosition());
        snake.setUserFast(distance2 < lookAheadDistance * lookAheadDistance);
    }

    private Snake findNextTarget() {
        final var headPosition = getSnake().getHeadPosition();
        final var otherSnakes = getSnakesInVicinity(targetSelectionRadius);

        Snake closestSnake = null;
        var closestDistance2 = Double.POSITIVE_INFINITY;

        for (final var otherSnake : otherSnakes) {
            if (otherSnake instanceof BoundarySnake) {
                continue;
            }

            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);

            if (d2 < closestDistance2) {
                closestSnake = otherSnake;
                closestDistance2 = d2;
            }
        }

        return closestSnake;
    }
}
