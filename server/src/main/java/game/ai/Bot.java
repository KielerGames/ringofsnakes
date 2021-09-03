package game.ai;

import game.Game;
import game.snake.Snake;
import game.snake.SnakeFactory;
import math.Vector;

public abstract class Bot {
    private Snake snake;
    private final Game game;
    
    public Bot(Game game, Vector spawnPosition){
        this.game = game;
        this.snake = SnakeFactory.createSnake(spawnPosition, game.world);
    }
    
    public Snake getSnake(){
        return this.snake;
    }
    
    public void act(){
        
    }
}
