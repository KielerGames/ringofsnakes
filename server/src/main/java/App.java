import game.snake.Snake;

public class App {
    public static void main(String[] args) {
        Snake snake = new Snake(44, 45);
        //snake.debug();
        snake.tick();
        //snake.debug();
        snake.tick();
        //snake.debug();
        System.out.println("Changing the course of hist... the snake");
        //snake.updateDirection(0.015);
        snake.tick();
        //snake.debug();
        //snake.fast = true;
        snake.tick();
        //snake.debug();


        for (int i = 0; i < 5000; i++) {
            snake.tick();
        }
        //snake.debug();


    }
}
