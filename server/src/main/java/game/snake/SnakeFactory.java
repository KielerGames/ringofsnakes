package game.snake;

import game.world.World;
import math.Vector;

import java.util.Random;

public class SnakeFactory {
    private static final Random random = new Random();
    private static short nextSnakeId = 0;

    private SnakeFactory() {
    }

    public static Snake createSnake(Vector position, World world) {
        final double direction = (random.nextDouble() * 2.0 - 1.0) * Math.PI;
        return createSnake(position, direction, world);
    }

    public static Snake createSnake(Vector position, double direction, World world) {
        Snake snake = new Snake(nextSnakeId++, world);
        snake.setSkin((byte) (random.nextInt(100) % 3));

        // start position & rotation
        snake.headPosition = position.clone();
        snake.headDirection = (float) direction;
        snake.setTargetDirection(snake.headDirection);
        snake.beginChunk();

        world.addSnake(snake);

        return snake;
    }

    public static Snake createTestSnake() {
        return createSnake(new Vector(0, 0), new World());
    }

}
