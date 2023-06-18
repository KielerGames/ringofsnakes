package game.ai.bot;

import game.ai.DirectionalSensor;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.World;
import math.Vector;
import math.Direction;

class ScaredBot extends Bot {
    private final DirectionalSensor dangerSensor = new DirectionalSensor();
    private int counter = random.nextInt(3) - 10;
    private boolean imminentDangerInPreviousTick = false;

    ScaredBot(World world) {
        super(world);
    }

    ScaredBot(Snake snake, World world) {
        super(snake, world);
    }

    @Override
    public void act() {
        counter++;

        final int delay = imminentDangerInPreviousTick ? 3 : 5;

        if (counter < delay) {
            return;
        }

        counter = 0;

        final var snake = this.getSnake();
        final var headPosition = snake.getHeadPosition();
        final var otherSnakeHeads = getSnakesInVicinity(25.0);
        final var otherSnakeChunks = getSnakeChunksInVicinity(20.0);

        // If there are snake heads there should also be other snake chunks.
        assert otherSnakeHeads.isEmpty() || !otherSnakeChunks.isEmpty();

        if (otherSnakeHeads.isEmpty() && otherSnakeChunks.isEmpty()) {
            if (random.nextDouble() < 0.25) {
                moveInRandomDirection();
            }
            imminentDangerInPreviousTick = false;
            return;
        }

        dangerSensor.reset();

        // Consider other snakes in the vicinity.
        otherSnakeHeads.forEach(otherSnake -> {
            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);
            final var dangerDirection = Direction.getFromTo(headPosition, pos);
            // TODO: direction should factor into intensity
            dangerSensor.add(dangerDirection, otherSnake.getWidth() / d2);
        });

        otherSnakeChunks.stream()
                .flatMap(SnakeChunk::getActivePathData)
                .forEach(snakePathPoint -> {
                    final var d2 = Vector.distance2(headPosition, snakePathPoint.point);
                    final var wd = 0.5 * snakePathPoint.getSnakeWidth();

                    final var closeness = 1.0 / Math.max(d2 - wd * wd, wd * wd);
                    final var dangerDirection = Direction.getFromTo(headPosition, snakePathPoint.point);
                    dangerSensor.add(dangerDirection, 0.25 * closeness);
                });

        // Escape in the direction where there is the least danger.
        final var sensorData = dangerSensor.findExtrema();
        final var escapeDirection = sensorData.minDirection();

        imminentDangerInPreviousTick = sensorData.maxValue() > 100.0;

        // This offset should make the movement seem more natural.
        final var offset = (random.nextDouble() - 0.5) * DirectionalSensor.BUCKET_SIZE;

        snake.setTargetDirection(Direction.normalize(escapeDirection + offset));
    }
}
