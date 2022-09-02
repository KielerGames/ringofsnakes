package game.events;

import game.snake.Snake;

import javax.annotation.Nullable;

public final class SnakeDeathEvent {
    public final Snake snake;
    @Nullable public final Snake killer;

    private SnakeDeathEvent(Snake snake, Snake killer) {
        this.snake = snake;
        this.killer = killer;
    }

    public static SnakeDeathEvent crashedIntoSnake(Snake deadSnake, Snake otherSnake) {
        return new SnakeDeathEvent(deadSnake, otherSnake);
    }

    public static SnakeDeathEvent externalCause(Snake deadSnake) {
        return new SnakeDeathEvent(deadSnake, null);
    }
}
