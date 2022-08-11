package game.ai;

import game.world.World;
import math.Vector;

import java.util.Random;

public class ScaredBot extends Bot {

    private static final double TAU = Math.PI * 2.0;
    private final Random random = new Random();
    private int counter = random.nextInt(3);

    public ScaredBot(World world) {
        super(world);
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
                snake.setTargetDirection(random.nextDouble() * TAU - Math.PI);
            }
            return;
        }

        // each bucket represents an escape direction
        final int numBuckets = 12;
        final var buckets = new double[numBuckets];
        otherSnakes.forEach(otherSnake -> {
            final var pos = otherSnake.getHeadPosition();
            final var d2 = Vector.distance2(headPosition, pos);
            // note that this is the escape direction
            final var dir = Math.atan2(headPosition.y - pos.y, headPosition.x - pos.x);
            final int bucket = (int) Math.floor(numBuckets * (dir + Math.PI) / TAU);
            buckets[bucket] += otherSnake.getWidth() / d2;
        });

        // find best escape direction
        var maxValue = Double.NEGATIVE_INFINITY;
        int maxIndex = -1;
        for (int i = 0; i < numBuckets; i++) {
            if (buckets[i] > maxValue) {
                maxIndex = i;
                maxValue = buckets[i];
            }
        }

        //assert (minIndex >= 0);
        // TODO fix exception handling

        snake.setTargetDirection(maxIndex * (TAU / numBuckets) - Math.PI);
    }
}
