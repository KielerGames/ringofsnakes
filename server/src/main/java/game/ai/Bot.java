package game.ai;

import game.Game;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import math.Vector;

import java.util.Collections;

public abstract class Bot {
    private final Game game;
    private Snake snake;

    public Bot(Game game, Vector spawnPosition) {
        final var name = SnakeNameGenerator.generateBotName();
        this.game = game;
        this.snake = SnakeFactory.createSnake(spawnPosition, game.world, name);
    }

    public Snake getSnake() {
        return this.snake;
    }

    public boolean isAlive() {
        return snake.isAlive();
    }

    public abstract void act();
}
