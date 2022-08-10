package game.ai;

import game.snake.Snake;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.World;
import lombok.Getter;
import math.Vector;

public abstract class Bot {
    protected World world;
    @Getter private final Snake snake;

    public Bot(World world, Vector spawnPosition) {
        final var name = SnakeNameGenerator.generateBotName();
        this.world = world;
        this.snake = SnakeFactory.createSnake(spawnPosition, world, name);
    }

    public boolean isAlive() {
        return snake.isAlive();
    }

    public abstract void act();
}
