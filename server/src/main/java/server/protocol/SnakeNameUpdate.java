package server.protocol;

import game.snake.Snake;

import java.util.HashMap;
import java.util.Map;

public class SnakeNameUpdate extends ServerToClientJSONMessage {
    public final Map<Integer, String> names = new HashMap<>();

    public void addNameOf(Snake snake) {
        names.put((int) snake.id, snake.name);
    }

    public boolean isEmpty() {
        return this.names.isEmpty();
    }
}
