package server;

import game.snake.Snake;
import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;

public class Player {
    public Snake snake;
    public Session session;

    public Player(Snake snake, Session session) {
        this.snake = snake;
        this.session = session;
    }

    public void send(ByteBuffer binaryData) {
        if(session.isOpen()) {
            session.getAsyncRemote().sendBinary(binaryData);
        }
    }

    public void send(String textData) {
        if(session.isOpen()) {
            session.getAsyncRemote().sendText(textData);
        }
    }

    public void sendSync(String textData) {
        if(session.isOpen()) {
            try {
                session.getBasicRemote().sendText(textData);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
