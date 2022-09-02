package server.clients;

import game.snake.Snake;
import lombok.Getter;
import math.BoundingBox;
import server.protocol.GameInfo;
import server.protocol.GameUpdate;
import util.JSON;

import javax.websocket.Session;

public class Player extends Client {
    @Getter private final Snake snake;

    public Player(Snake snake, Session session) {
        super(session);
        this.snake = snake;
        send(JSON.stringify(GameInfo.createForPlayer(snake)));
    }

    @Override
    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
        super.onBeforeUpdateBufferIsCreated(update);
        update.addSnakeChunk(snake.currentChunk);
    }

    @Override
    public BoundingBox getKnowledgeBox() {
        // TODO
        return new BoundingBox(snake.getHeadPosition(), viewBoxRatio * 48f, 48f);
    }

    public String getName() {
        return this.snake.name;
    }
}
