package game.snake;

import game.world.World;
import math.Direction;
import math.Vector;
import org.mockito.Mockito;

import java.util.concurrent.ThreadLocalRandom;

public class TestSnakeFactory {
    private static char nextSnakeId = (char) 1;

    public static Snake createSnake() {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return SnakeFactory.createSnake(new Vector(0, 0), direction, new World(), "TestSnake");
    }

    public static Snake createSnake(World world) {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return SnakeFactory.createSnake(new Vector(0, 0), direction, world, "TestSnake");
    }

    public static Snake createSnake(Vector position, World world) {
        // TODO: use seeded random in tests
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createSnake(position, direction, world);
    }

    public static Snake createSnake(Vector position, double direction, World world) {
        return SnakeFactory.createSnake(position, direction, world, "TestSnake");
    }

    public static Snake createMockedSnake(Vector position, World world) {
        var id = nextSnakeId++;
        var snake = new Snake(id, world, "TestSnake", (byte) 0);

        snake.headPosition = position.clone();
        snake.headDirection = Direction.RIGHT;
        snake.setTargetDirection(snake.getHeadDirection());
        snake.beginChunk();

        var mock = Mockito.spy(snake);

        world.addSnake(mock);

        return mock;
    }
}
