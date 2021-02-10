import game.Snake;

public class App {
    public static void main(String[] args) {
        Snake snake = new Snake(44, 45);
        snake.tick();
        snake.tick();
        snake.updateDirection(80, 2);
        snake.tick();
        snake.updateDirection(81, 2);
        snake.tick();
        snake.updateDirection(82, 2);
        snake.tick();
        snake.updateDirection(83, 2);
        snake.debug();


    }
}
