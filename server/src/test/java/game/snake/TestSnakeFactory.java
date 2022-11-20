package game.snake;

import game.world.World;
import lombok.Setter;
import math.Direction;
import math.Vector;
import org.mockito.Mockito;

import java.util.Random;

public class TestSnakeFactory {
    private static char nextSnakeId = (char) 1;
    @Setter private static Random random;

    public static Snake createSnake() {
        return createSnake(new World());
    }

    public static Snake createSnake(World world) {
        final double direction = getRandomDirection();
        return SnakeFactory.createSnake(new Vector(0, 0), direction, world, "TestSnake");
    }

    public static Snake createSnake(World world, double direction) {
        return SnakeFactory.createSnake(new Vector(0, 0), direction, world, "TestSnake");
    }

    public static Snake createSnake(Vector position, World world) {
        final double direction = getRandomDirection();
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

    private static double getRandomDirection() {
        if (random == null) {
            return Direction.RIGHT;
        }

        return Direction.getRandom(random);
    }
}
