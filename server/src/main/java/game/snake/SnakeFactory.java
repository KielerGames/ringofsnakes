package game.snake;

import game.world.World;
import math.Vector;
import java.nio.ByteBuffer;
import java.nio.file.attribute.PosixFileAttributes;
import java.util.Random;

public class SnakeFactory {
    private static short nextSnakeId = 0;
    private static final Random random = new Random();

    private SnakeFactory(){
    }

    public static Snake createSnake(Vector position, World world){
        Snake snake = new Snake(nextSnakeId++, world);
        snake.setSkin((byte) (random.nextInt(100) % 3));

        ByteBuffer snakeInfoBuffer = ByteBuffer.allocate(Snake.INFO_BYTE_SIZE);
        snakeInfoBuffer.putShort(0, snake.id);
        snakeInfoBuffer.put(2, snake.skin);
        snake.setSnakeInfoBuffer(snakeInfoBuffer);

        // start position & rotation
        snake.headPosition = position.clone();
        snake.headDirection = (float) ((random.nextDouble() * 2.0 - 1.0) * Math.PI);
        snake.setTargetDirection(snake.headDirection);
        snake.beginChunk();

        return snake;
    }

    public static Snake createSnake(){
        return createSnake(new Vector(0,0), new World());
    }

}
