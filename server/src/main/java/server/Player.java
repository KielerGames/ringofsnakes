package server;

import game.snake.Snake;
import server.protocol.GameUpdate;

import javax.websocket.Session;

public class Player extends Client {
    public Snake snake;

    public Player(Snake snake, Session session) {
        super(session);
        this.snake = snake;
    }

    @Override
    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
        super.onBeforeUpdateBufferIsCreated(update);
        update.addSnakeChunk(snake.chunkBuilder);
    }
}
