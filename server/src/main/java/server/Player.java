package server;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeChunkData;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.Set;

public class Player {
    public Snake snake;
    public Session session;
    private Set<Integer> knownChunks = new HashSet<>();
    private GameUpdate nextUpdate;

    public Player(Snake snake, Session session) {
        this.snake = snake;
        this.session = session;
        nextUpdate = new GameUpdate();
    }

    public void updateChunk(SnakeChunkData chunk) {
        if(knownChunks.contains(chunk.getUniqueId())) {
            nextUpdate.addSnake(chunk.getSnake());
        } else {
            nextUpdate.addSnakeChunk(chunk);
            if(chunk.isFull()) {
                knownChunks.add(chunk.getUniqueId());
            }
        }
    }

    public void sendUpdate() {
        var update = this.nextUpdate;
        this.nextUpdate = new GameUpdate();
        update.addSnakeChunk(snake.chunkBuilder);
        send(update.createBuffer());
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

    public boolean sendSync(String textData) {
        if(session.isOpen()) {
            try {
                session.getBasicRemote().sendText(textData);
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }

        return true;
    }

    public BoundingBox getViewBox() {
        //TODO
        return null;
    }
}
