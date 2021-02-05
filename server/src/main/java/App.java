import game.Snake;

public class App {
    public static void main(String[] args) {
        Snake snake = new Snake();
        snake.tick();
        snake.tick();
        snake.updateDirection(80, 2);
        snake.tick();
        snake.tick();
        snake.fast = true;
        snake.tick();
        snake.tick();

    }
}
