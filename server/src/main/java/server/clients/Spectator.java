package server.clients;

import game.snake.Snake;
import math.BoundingBox;
import math.Vector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import server.protocol.SpectatorChange;
import util.JSON;

import javax.annotation.Nullable;
import javax.websocket.CloseReason;
import java.io.IOException;

public class Spectator extends Client {
    private static final Logger LOGGER = LoggerFactory.getLogger(Spectator.class);
    private static final CloseReason ILLEGAL_INPUT = new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "User input not allowed as spectator.");
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
        final var info = (snake == null) ? new SpectatorChange(position) : new SpectatorChange(snake);

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

    @Override
    public void handleUserInput(float alpha, boolean fast) {
        // Spectators are not allowed to send any input.

        if (getAgeInSeconds() < 2) {
            // Grace period to avoid race condition.
            return;
        }

        LOGGER.error("Illegal request from client.");
        try {
            session.close(ILLEGAL_INPUT);
            // TODO: does this cause removeClient to be called?
        } catch (IOException e) {
            LOGGER.error(e.getMessage());
        }
    }
}
