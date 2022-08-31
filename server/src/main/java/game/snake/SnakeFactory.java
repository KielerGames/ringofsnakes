package game.snake;

import game.world.World;
import math.Direction;
import math.Vector;

import java.util.concurrent.ThreadLocalRandom;

public class SnakeFactory {
    private static char nextSnakeId = 42;

    private SnakeFactory() {
    }

    public static Snake createSnake(Vector position, World world, String name) {
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createSnake(position, direction, world, name);
    }

    public static Snake createSnake(Vector position, double direction, World world, String name) {
        final var id = generateSnakeId();
        final var snake = new Snake(id, world, name);
        snake.setSkin(pickSnakeSkin());

        // start position & rotation
        snake.headPosition = position.clone();
        snake.headDirection = direction;
        snake.setTargetDirection(snake.headDirection);
        snake.beginChunk();

        world.addSnake(snake);

        return snake;
    }

    public static BoundarySnake createBoundarySnake(World world) {
        final var snake = new BoundarySnake(generateSnakeId(), world);
        snake.setSkin(pickSnakeSkin());

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

    private static byte pickSnakeSkin() {
        return (byte) ThreadLocalRandom.current().nextInt(7);
    }

    // TODO: move methods only used by tests to the test source folder
    public static Snake createTestSnake() {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createSnake(new Vector(0, 0), direction, new World(), "TestSnake");
    }

    public static Snake createTestSnake(World world) {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createSnake(new Vector(0, 0), direction, world, "TestSnake");
    }

    public static Snake createTestSnake(Vector position, World world) {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createTestSnake(position, direction, world);
    }

    public static Snake createTestSnake(Vector position, double direction, World world) {
        return createSnake(position, direction, world, "TestSnake");
    }
}
