package game.ai;

import game.world.World;
import math.Vector;
import util.Direction;

class ScaredBot extends Bot {

    private int counter = random.nextInt(3) - 10;

    ScaredBot(World world) {
        super(world);
    }

    private static int findIndexOfMaxValue(double[] values) {
        var maxValue = Double.NEGATIVE_INFINITY;
        int maxIndex = -1;
        for (int i = 0; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxIndex = i;
                maxValue = values[i];
            }
        }

        return maxIndex;
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
        final var otherSnakes = getSnakesInNeighborhood();

        if (otherSnakes.isEmpty()) {
            if (random.nextDouble() < 0.25) {
                moveInRandomDirection();
            }
            return;
        }

        // each bucket represents an escape direction
        final int numBuckets = 16;
        final var buckets = new double[numBuckets];
        otherSnakes.forEach(otherSnake -> {
            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);
            final var escapeDir = Math.atan2(headPosition.y - pos.y, headPosition.x - pos.x);
            final int bucket = (int) Math.floor(numBuckets * (escapeDir + Math.PI) / TAU);
            buckets[bucket] += otherSnake.getWidth() / d2;
        });

        // TODO: consider SnakeChunks in vicinity

        // find best escape direction
        final int maxIndex = findIndexOfMaxValue(buckets);

        if (maxIndex < 0) {
            // theoretically this should never happen
            return;
        }

        final var bucketDirection = maxIndex * (TAU / numBuckets) - Math.PI;
        // this offset should make the movement seem more natural
        final var offset = (random.nextDouble() - 0.5) * (TAU / numBuckets);

        snake.setTargetDirection(Direction.normalize(bucketDirection + offset));
    }
}
