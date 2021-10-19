package game.ai;

import game.Game;
import game.snake.Snake;
import game.snake.SnakeFactory;
import math.Vector;

public abstract class Bot {
    private final Game game;
    private Snake snake;

    public Bot(Game game, Vector spawnPosition) {
        this.game = game;
        this.snake = SnakeFactory.createSnake(spawnPosition, game.world);
    }

    public Snake getSnake() {
        return this.snake;
    }

    public boolean isAlive() {
        return snake.isAlive();
    }

    public abstract void act();
}
