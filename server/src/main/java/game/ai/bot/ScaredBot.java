package game.ai.bot;

import game.ai.DirectionalSensor;
import game.snake.SnakeChunk;
import game.world.World;
import math.Vector;
import math.Direction;

import java.util.List;

import static game.ai.DirectionalSensor.BUCKETS;
import static math.Direction.TAU;

class ScaredBot extends Bot {
    private final DirectionalSensor dangerSensor = new DirectionalSensor();
    private final double maxDistanceFromCenter;
    private int counter = random.nextInt(3) - 10;

    ScaredBot(World world) {
        super(world);
        maxDistanceFromCenter = 0.4 * world.box.getWidth();
    }

    @Override
    public void act() {
        counter++;

        if (counter < 5) {
            return;
        }

        counter = 0;

        final var snake = this.getSnake();
        final var headPosition = snake.getHeadPosition();
        final var otherSnakes = getSnakesInVicinity(28.0);
        final var otherSnakeChunks = getSnakeChunksInVicinity(28.0);

        if (otherSnakes.isEmpty()) {
            if (random.nextDouble() < 0.25) {
                moveInRandomDirection();
            }
            return;
        }

        dangerSensor.reset();

        // Consider other snakes in the vicinity.
        // TODO: consider SnakeChunks in vicinity
        otherSnakes.forEach(otherSnake -> {
            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);
            final var dangerDirection = Direction.getFromTo(pos, headPosition);
            // TODO: direction should factor into intensity
            dangerSensor.add(dangerDirection, -otherSnake.getWidth() / d2);
        });

        /*otherSnakeChunks.stream()
                .flatMap(SnakeChunk::getActivePathData)
                .forEach(snakePathPoint -> {
                    final var d2 = Vector.distance2(headPosition, snakePathPoint.point);
                    final var wd = 0.5 * snakePathPoint.getSnakeWidth();
                    final var dangerDirection = Direction.getFromTo(headPosition, snakePathPoint.point);
                    // TODO: approx
                    dangerSensor.add(dangerDirection, d2 - wd * wd);
                });*/

        // Add a slight preference for keeping the current direction.
        dangerSensor.add(snake.getHeadDirection(), -snake.getWidth() / 20.0);

        // When close to the edge, move towards center.
        {
            final var centerDir = Direction.getFromTo(headPosition, world.center);
            final var centerDist = Vector.distance(headPosition, world.center);
            final var centerDesire = 0.05 * Math.max(0.0, centerDist - maxDistanceFromCenter);
            dangerSensor.add(centerDir, -centerDesire);
        }

        // Escape in the direction where there is the least danger.
        final var sensorData = dangerSensor.findExtrema();
        final var escapeDirection = sensorData.minDirection();

        // This offset should make the movement seem more natural.
        final var offset = (random.nextDouble() - 0.5) * (TAU / BUCKETS);

        snake.setTargetDirection(Direction.normalize(escapeDirection + offset));
    }
}
