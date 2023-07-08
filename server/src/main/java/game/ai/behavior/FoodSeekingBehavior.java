package game.ai.behavior;

import game.ai.DirectionalSensor;
import game.snake.Snake;
import game.world.Food;
import game.world.WorldChunk;
import math.Direction;
import math.Vector;

import java.util.stream.Stream;

public class FoodSeekingBehavior {

    private final static double PERCEPTION_RANGE = 32.0;

    private final static DirectionalSensor directionalSensor = new DirectionalSensor();

    public static InputSuggestion computeInputSuggestion(Snake snake) {
        final var foodSensor = directionalSensor;
        final var head = snake.getHeadPosition();
        foodSensor.reset();

        streamPerceptibleFood(snake).forEach(food -> {
            final var relativeDirection = Direction.getFromTo(head, food.position);
            final var dot = Direction.dot(relativeDirection, Direction.getFromTo(head, food.position));
            final var d2 = Vector.distance2(head, food.position);
            final var relativeDistance = d2 / (PERCEPTION_RANGE * PERCEPTION_RANGE);
            final var similarity = 0.5 * (dot + 1.0);
            final var valueFactor = (1.0 - relativeDistance) * Math.max(0.1, similarity * similarity);
            final var value = valueFactor * food.size.radius * food.size.radius;
            foodSensor.add(relativeDirection, value);
        });
        final var extrema = foodSensor.findExtrema();

        if (extrema.maxValue() == 0.0) {
            return new InputSuggestion(snake.getHeadDirection(), snake.isFast());
        }

        final var directionsSimilar = Direction.dot(snake.getHeadDirection(), extrema.maxDirection()) > 0.5;
        final var moreThanAverageFood = extrema.maxValue() > 4.2;
        // TODO: consider partial input suggestion
        return new InputSuggestion(extrema.maxDirection(), directionsSimilar && moreThanAverageFood);
    }

    private static Stream<Food> streamPerceptibleFood(Snake snake) {
        final var world = snake.getWorld();
        final var head = snake.getHeadPosition();
        final var worldChunk = world.chunks.findChunk(head);

        return Stream.concat(Stream.of(worldChunk), worldChunk.neighbors.stream())
                .flatMap(WorldChunk::streamFood)
                .filter(food -> food.isWithinRange(head, PERCEPTION_RANGE));
    }
}
