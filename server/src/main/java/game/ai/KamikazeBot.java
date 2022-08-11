package game.ai;

import game.snake.BoundarySnake;
import game.snake.Snake;
import game.world.World;
import math.Vector;

class KamikazeBot extends Bot {

    private int counter = random.nextInt(4) - 42;

    private final double minKamikazeLength;

    public KamikazeBot(World world) {
        super(world);
        minKamikazeLength = 1.5 * world.getConfig().snakes.minLength;
    }

    @Override
    public void act() {
        counter++;

        if (counter < 4) {
            return;
        }

        counter = 0;

        if (getSnake().getLength() < minKamikazeLength) {
            if (random.nextDouble() < 0.3) {
                moveInRandomDirection();
            }
            return;
        }

        kamikaze();
    }

    private void kamikaze() {
        final var snake = this.getSnake();

        if (snake.getLength() < snake.config.snakes.minLength) {
            return;
        }

        final var headPosition = snake.getHeadPosition();
        final var otherSnakes = getSnakesInNeighborhood();

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

        if (closestSnake == null) {
            if (random.nextDouble() < 0.25) {
                moveInRandomDirection();
            }
            return;
        }

        final var lookAhead = 12.0 * snake.config.snakes.speed;
        final var pos = closestSnake.getHeadPosition().clone();
        pos.addDirection(closestSnake.getHeadDirection(), lookAhead);

        snake.setTargetDirection(
                Math.atan2(pos.y - headPosition.y, pos.x - headPosition.x)
        );

        if (random.nextBoolean()) {
            return;
        }

        snake.setUserFast(Math.sqrt(closestDistance2) < lookAhead);
    }
}
