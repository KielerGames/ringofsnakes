package server.clients;

import game.snake.Snake;
import math.BoundingBox;
import math.Vector;
import server.protocol.SpectatorChange;
import util.JSON;

import javax.annotation.Nullable;

public class Spectator extends Client {
    private Vector position;

    private Spectator(Player player, Vector position, @Nullable Snake snake) {
        super(player.session, player.knowledge, snake);
        this.position = position;
        this.viewBoxRatio = player.viewBoxRatio;
        sendInitialMessage();
    }

    public static Spectator createFor(Snake snake, Player player) {
        return new Spectator(player, snake.getHeadPosition(), snake);
    }

    private void sendInitialMessage() {
        final var info = (snake == null) ?
                new SpectatorChange(position) :
                new SpectatorChange(snake);

        send(JSON.stringify(info));
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
            send(JSON.stringify(new SpectatorChange(this.snake)));
        } else {
            send(JSON.stringify(new SpectatorChange(position)));
        }
    }

    @Override
    public BoundingBox getKnowledgeBox() {
        final var center = (snake == null) ? position : snake.getHeadPosition();
        return new BoundingBox(center, viewBoxRatio * 48f, 48f);
    }
}
