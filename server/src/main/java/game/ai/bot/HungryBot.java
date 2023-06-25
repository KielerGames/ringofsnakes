package game.ai.bot;

import game.ai.DirectionalSensor;
import game.world.Food;
import game.world.World;
import game.world.WorldChunk;
import math.Direction;

import java.util.stream.Stream;

public class HungryBot extends Bot {
    private final DirectionalSensor foodSensor = new DirectionalSensor();
    private final static double PERCEPTION_RANGE = 32.0;
    private final static double FIELD_OF_VIEW = Math.PI;
    private int counter = 0;

    public HungryBot(World world) {
        super(world);
    }

    @Override
    public void act() {
        counter++;

        if (counter < 4) {
            return;
        }

        counter = 0;

        final var snake = getSnake();
        final var head = snake.getHeadPosition();
        foodSensor.reset();

        streamPerceptibleFood().forEach(food -> {
            final var dir = Direction.getFromTo(head, food.position);
            foodSensor.add(dir, food.size.radius * food.size.radius);
        });
        final var extrema = foodSensor.findExtrema();

        if (extrema.maxValue() == 0.0) {
            return;
        }

        snake.setTargetDirection(extrema.maxDirection());
    }

    private Stream<Food> streamPerceptibleFood() {
        final var snake = getSnake();
        final var head = snake.getHeadPosition();
        final var dir = snake.getHeadDirection();
        final var worldChunk = world.chunks.findChunk(head);
        final var bound = Math.cos(0.5 * FIELD_OF_VIEW);

        return Stream.concat(Stream.of(worldChunk), worldChunk.neighbors.stream())
                .flatMap(WorldChunk::streamFood)
                .filter(food -> food.isWithinRange(head, PERCEPTION_RANGE))
                .filter(food -> Direction.dot(dir, Direction.getFromTo(head, food.position)) > bound);
    }

}
