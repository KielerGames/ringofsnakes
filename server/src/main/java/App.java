import game.Snake;

public class App {
    public static void main(String[] args) {
        Snake snake = new Snake(44, 45);
        snake.debug();
        snake.tick();
        snake.debug();
        snake.tick();
        snake.debug();
        System.out.println("Changing the course of hist... the snake");
        snake.updateDirection(3.14);
        snake.tick();
        snake.debug();
        snake.fast = true;
        snake.tick();
        snake.debug();


    }
}
