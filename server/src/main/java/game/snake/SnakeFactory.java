package game.snake;

import game.world.World;
import math.Vector;
import util.Direction;

import java.util.Random;

public class SnakeFactory {
    private static final Random random = new Random();
    private static char nextSnakeId = 0;

    private SnakeFactory() {
    }

    public static Snake createSnake(Vector position, World world) {
        final double direction = Direction.getRandom(random);
        return createSnake(position, direction, world);
    }

    public static Snake createSnake(Vector position, double direction, World world) {
        Snake snake = new Snake(nextSnakeId++, world);
        snake.setSkin((byte) random.nextInt(7));

        // start position & rotation
        snake.headPosition = position.clone();
        snake.headDirection = direction;
        snake.setTargetDirection(snake.headDirection);
        snake.beginChunk();

        world.addSnake(snake);

        return snake;
    }

    public static Snake createTestSnake() {
        return createSnake(new Vector(0, 0), new World());
    }

    public static BoundarySnake createBoundarySnake(World world) {
        final var snake = new BoundarySnake(nextSnakeId++, world);
        snake.setSkin((byte) random.nextInt(7));

        snake.beginChunk();
        world.addSnake(snake);

        final int iterations = (int) Math.ceil(snake.getLength() / world.getConfig().snakes.speed);
        for (int i = 0; i < iterations; i++) {
            snake.tick();
        }

        return snake;
    }
}
