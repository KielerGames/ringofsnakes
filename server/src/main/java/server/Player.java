package server;

import game.snake.Snake;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;

public class Player extends Client {
    public Snake snake;
    private int updateCount = 0;

    public Player(Snake snake, Session session) {
        super(session);
        this.snake = snake;
    }

    @Override
    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
        super.onBeforeUpdateBufferIsCreated(update);
        update.addSnakeChunk(snake.chunkBuilder);

        if(updateCount % 20 == 0 && !update.isEmpty()) {
            System.out.println(update);
        }

        updateCount++;
    }

    @Override
    public BoundingBox getKnowledgeBox() {
        return new BoundingBox(snake.getHeadPosition(), 42.0, 42.0);
    }
}
