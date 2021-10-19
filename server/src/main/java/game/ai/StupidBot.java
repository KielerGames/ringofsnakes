package game.ai;

import game.Game;
import game.snake.Snake;
import math.Vector;

import java.util.Random;

public class StupidBot extends Bot {

    private static Random random = new Random();
    private float alpha = (float) -Math.PI;
    private int counter = 1;
    private boolean turnClockwise = true;
    private int changeDirectionAtCounter = 120;
    private boolean movingToPoint = false;
    private int stepsTakenTowardsPoint = 0;
    private final double keepThisDistanceToMapEdge = 40;

    public StupidBot(Game game, Vector spawnPosition) {
        super(game, spawnPosition);
    }

    @Override
    public void act() {
        Snake snake = this.getSnake();
        float turningRate = (float) Math.PI / 120;

        if(Math.abs(snake.getHeadPosition().x) > getWorldWidth()/2.0 - keepThisDistanceToMapEdge
        || (Math.abs(snake.getHeadPosition().y) > getWorldHeight()/2.0 - keepThisDistanceToMapEdge) ){
            moveTowardsPosition(snake, new Vector(0, 0));
            movingToPoint = true;
        }

        if(movingToPoint){
            stepsTakenTowardsPoint++;
            if(stepsTakenTowardsPoint > 50){
                movingToPoint = false;
                stepsTakenTowardsPoint = 0;
            }
            return;
        }

        if (!turnClockwise) {
            alpha = alpha > Math.PI ? (float) -Math.PI : alpha + turningRate;
        } else {
            alpha = alpha < -Math.PI ? (float) Math.PI : alpha - turningRate;
        }

        if (counter > changeDirectionAtCounter) {
            turnClockwise = random.nextBoolean();
            changeDirectionAtCounter = 60 + random.nextInt(120);
            counter = 0;
        }
        snake.setTargetDirection(alpha);
        counter++;
    }

    private void moveTowardsPosition(Snake snake, Vector targetPosition) {
        if(!this.movingToPoint){
        Vector targetDirection = determineTargetDirection(snake.getHeadPosition(), targetPosition);
        var directionAlpha = (float) Math.atan2(targetDirection.y, targetDirection.x);
        snake.setTargetDirection(directionAlpha);
        }
    }

    private Vector determineTargetDirection(Vector headPosition, Vector targetPosition) {
        var direction = targetPosition.clone();
        direction.addScaled(headPosition , -1);
        direction.normalize();
        //System.out.println("direction: x = " + direction.x + ", y = " + direction.y);
        return direction;
    }

}
