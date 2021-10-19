package game.ai;

import game.Game;
import game.snake.Snake;
import game.snake.SnakeFactory;
import math.Vector;

public abstract class Bot {
    private final Game game;
    private Snake snake;
    private final double worldHeight;
    private final double worldWidth;

    public Bot(Game game, Vector spawnPosition) {
        this.game = game;
        this.snake = SnakeFactory.createSnake(spawnPosition, game.world);
        this.worldHeight = game.world.height;
        this.worldWidth = game.world.width;
    }

    public Snake getSnake() {
        return this.snake;
    }

    public boolean isAlive() {
        return snake.isAlive();
    }

    public double getWorldHeight(){
        return this.worldHeight;
    }

    public double getWorldWidth() {
        return this.worldWidth;
    }

    public abstract void act();
}
