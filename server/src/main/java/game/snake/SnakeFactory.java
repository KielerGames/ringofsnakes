package game.snake;

import game.world.World;
import math.Direction;
import math.Vector;

import java.util.Collections;
import java.util.Map;
import java.util.WeakHashMap;
import java.util.concurrent.ThreadLocalRandom;

public class SnakeFactory {
    private static final Map<World, Integer> nextSnakeIds = Collections.synchronizedMap(new WeakHashMap<>(1));

    private SnakeFactory() {
    }

    public static Snake createSnake(Vector position, World world, String name) {
        final double direction = Direction.getRandom(ThreadLocalRandom.current());
        return createSnake(position, direction, world, name);
    }

    public static Snake createSnake(Vector position, double direction, World world, String name) {
        final var id = generateSnakeId(world);
        final var snake = new Snake(id, world, name, pickSnakeSkin());

        // start position & rotation
        snake.headPosition = position.clone();
        snake.headDirection = direction;
        snake.setTargetDirection(snake.headDirection);
        snake.beginChunk();

        world.addSnake(snake);

        return snake;
    }

    static Snake createSnakeWithLength(Vector position, double direction, World world, String name, double length) {
        final var snake = createSnake(position, direction, world, name);
        snake.setLength(length);
        return snake;
    }

    public static BoundarySnake createBoundarySnake(World world) {
        final var snake = new BoundarySnake(generateSnakeId(world), world);

        snake.beginChunk();
        world.addSnake(snake);

        final int iterations = (int) Math.ceil(snake.getLength() / world.getConfig().snakes.speed);
        for (int i = 0; i < iterations; i++) {
            snake.tick();
        }

        return snake;
    }

    private static char generateSnakeId(World world) {
        final int intId = nextSnakeIds.compute(world, (w, oldId) -> {
            if (oldId == null) {
                return 42;
            }

            if (oldId == -1) {
                // 0 is a special value reserved for later use as null
                return 1;
            }

            return oldId + 1;
        });

        return (char) intId;
    }

    private static byte pickSnakeSkin() {
        return (byte) ThreadLocalRandom.current().nextInt(Snake.NUMBER_OF_SKINS);
    }

}
