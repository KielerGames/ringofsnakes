package game.snake;

import game.world.World;
import math.Direction;
import math.Vector;

import java.util.Random;

public class SnakeFactory {
    private static final Random random = new Random();
    private static char nextSnakeId = 42;

    private SnakeFactory() {
    }

    public static Snake createSnake(World world) {
        return createSnake(world.findSpawnPosition(), world);
    }

    public static Snake createSnake(Vector position, World world) {
        final double direction = Direction.getRandom(random);
        return createSnake(position, direction, world);
    }

    public static Snake createSnake(Vector position, World world, String name) {
        final double direction = Direction.getRandom(random);
        return createSnake(position, direction, world, name);
    }

    public static Snake createSnake(Vector position, double direction, World world) {
        return createSnake(position, direction, world, null);
    }

    public static Snake createSnake(Vector position, double direction, World world, String name) {
        final var id = generateSnakeId();
        Snake snake = name == null ? new Snake(id, world) : new Snake(id, world, name);
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
        final double direction = Direction.getRandom(random);
        return createSnake(new Vector(0, 0), direction, new World(), "TestSnake");
    }

    public static Snake createTestSnake(World world) {
        final double direction = Direction.getRandom(random);
        return createSnake(new Vector(0, 0), direction, world, "TestSnake");
    }

    public static BoundarySnake createBoundarySnake(World world) {
        final var snake = new BoundarySnake(generateSnakeId(), world);
        snake.setSkin((byte) random.nextInt(7));

        snake.beginChunk();
        world.addSnake(snake);

        final int iterations = (int) Math.ceil(snake.getLength() / world.getConfig().snakes.speed);
        for (int i = 0; i < iterations; i++) {
            snake.tick();
        }

        return snake;
    }

    private static char generateSnakeId() {
        final var id = nextSnakeId;

        nextSnakeId++;

        if (nextSnakeId == 0) {
            // 0 is a special value reserved for later use as null
            nextSnakeId++;
        }

        return id;
    }
}
