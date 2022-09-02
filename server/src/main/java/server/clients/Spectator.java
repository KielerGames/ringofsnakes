package server.clients;

import game.snake.Snake;
import math.BoundingBox;
import math.Vector;
import server.protocol.GameInfo;
import util.JSON;

import javax.annotation.Nullable;
import javax.websocket.Session;

public class Spectator extends Client {
    private @Nullable Snake snake;
    private Vector position;

    private Spectator(Session session, @Nullable Snake snake, Vector position) {
        super(session);
        this.snake = snake;
        this.position = position;
        final var info = (snake == null) ?
                GameInfo.createForSpectator(null /* TODO */, position) :
                GameInfo.createForSpectator(snake);
        // TODO copy client knowledge info
        send(JSON.stringify(info));
    }

    public static Spectator createFor(Snake snake, Session session) {
        return new Spectator(session, snake, snake.getHeadPosition());
    }

    public void setSnake(@Nullable Snake snake) {
        if (this.snake == snake) {
            return;
        }

        if (snake == null) {
            position = this.snake.getHeadPosition();
        }

        this.snake = snake;

        if (this.snake != null) {
            position = this.snake.getHeadPosition();
        }
    }

    @Override
    public BoundingBox getKnowledgeBox() {
        final var center = (snake == null) ? position : snake.getHeadPosition();
        return new BoundingBox(center, viewBoxRatio * 48f, 48f);
    }
}
