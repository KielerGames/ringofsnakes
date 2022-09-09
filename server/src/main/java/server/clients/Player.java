package server.clients;

import game.snake.Snake;
import math.BoundingBox;
import server.protocol.GameInfo;
import util.JSON;

import javax.annotation.Nonnull;
import javax.websocket.Session;

public class Player extends Client {

    public Player(Snake snake, Session session) {
        super(session, snake);
        send(JSON.stringify(new GameInfo(snake)));
    }

    @Override
    public BoundingBox getKnowledgeBox() {
        assert snake != null;
        // TODO
        return new BoundingBox(snake.getHeadPosition(), viewBoxRatio * 48f, 48f);
    }

    @Override
    public void handleUserInput(float alpha, boolean fast) {
        assert snake != null;
        snake.setTargetDirection(alpha);
        snake.setUserFast(fast);
    }

    public String getName() {
        assert snake != null;
        return this.snake.name;
    }

    @Override
    @Nonnull
    public Snake getSnake() {
        // A player always has a snake.
        assert snake != null;
        return snake;
    }
}
