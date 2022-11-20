package game.world;

import game.snake.TestSnakeFactory;
import math.Vector;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FoodEatingTest {
    @Test
    void testEatingFoodFromNeighboringChunk() {
        // Init world.
        var game = TestGame.createWithSmallWorld();
        var mainChunk = game.world.chunks.findChunk(Vector.ORIGIN);
        var neighborChunk = game.world.chunks.findChunk(new Vector(32.0, 0.0));

        // Init snake.
        var snake = TestSnakeFactory.createMockedSnake(Vector.ORIGIN, game.world);
        Mockito.when(snake.getWidth()).thenReturn(game.config.snakes.maxWidth);
        game.addSnake(snake);

        // Add a food item.
        neighborChunk.addFood(
                new Food(
                        new Vector(13.0, 0.0),
                        neighborChunk,
                        Food.Size.MEDIUM,
                        (byte) 0
                )
        );
        assertEquals(0, mainChunk.getFoodCount());
        var foodCount = neighborChunk.getFoodCount();
        assertEquals(1, foodCount);

        // Move towards next chunks.
        while (!neighborChunk.box.isWithinRange(snake.getHeadPosition(), 0.5 * snake.getWidth())) {
            snake.tick();
        }

        // Snake head is now partially in the other chunk and should consume food from it.
        game.tickN(1, false);
        assertTrue(neighborChunk.getFoodCount() < foodCount);
    }
}
