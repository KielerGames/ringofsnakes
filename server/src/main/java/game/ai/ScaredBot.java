package game.ai;

import game.world.World;
import math.Vector;
import math.Direction;

import static math.Direction.TAU;

class ScaredBot extends Bot {

    private static final int BUCKETS = 16;
    private final double maxDistanceFromCenter;
    private int counter = random.nextInt(3) - 10;

    ScaredBot(World world) {
        super(world);
        maxDistanceFromCenter = 0.4 * world.box.getWidth();
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
        final var otherSnakes = getSnakesInVicinity(28.0);

        if (otherSnakes.isEmpty()) {
            if (random.nextDouble() < 0.25) {
                moveInRandomDirection();
            }
            return;
        }

        // each bucket represents an escape direction
        final var buckets = new double[BUCKETS];
        otherSnakes.forEach(otherSnake -> {
            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);
            final var escapeDir = Direction.getFromTo(pos, headPosition);
            final int bucket = getBucketIndex(escapeDir);
            buckets[bucket] += otherSnake.getWidth() / d2;
        });

        // slight preference for the current direction
        {
            final int bucket = getBucketIndex(snake.getHeadDirection());
            buckets[bucket] += snake.getWidth() / 20.0;
        }

        // move towards center (when close to the edge)
        {
            final var centerDir = Direction.getFromTo(headPosition, world.center);
            final var centerDist = Vector.distance(headPosition, world.center);
            final int bucket = getBucketIndex(centerDir);
            buckets[bucket] += 0.05 * Math.max(0.0, centerDist - maxDistanceFromCenter);
        }

        // TODO: consider SnakeChunks in vicinity

        // find best escape direction
        final int maxIndex = findIndexOfMaxValue(buckets);

        if (maxIndex < 0) {
            // theoretically this should never happen
            return;
        }

        final var bucketDirection = maxIndex * (TAU / BUCKETS) - Math.PI;
        // this offset should make the movement seem more natural
        final var offset = (random.nextDouble() - 0.5) * (TAU / BUCKETS);

        snake.setTargetDirection(Direction.normalize(bucketDirection + offset));
    }

    private int getBucketIndex(double direction) {
        return (int) Math.floor(BUCKETS * (direction + Math.PI) / TAU);
    }
}
