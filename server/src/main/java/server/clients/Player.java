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
        if (snake == null) {
            throw new IllegalStateException();
        }
        // TODO
        return new BoundingBox(snake.getHeadPosition(), viewBoxRatio * 48f, 48f);
    }

    public String getName() {
        if (this.snake == null) {
            throw new IllegalStateException();
        }
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
