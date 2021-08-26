package server;

import game.snake.SnakeChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.Set;
import java.util.WeakHashMap;

public class Client {
    public final Session session;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private GameUpdate nextUpdate;

    public Client(Session session) {
        this.session = session;
        nextUpdate = new GameUpdate();
    }

    public void updateChunk(SnakeChunk chunk) {
        if (knownSnakeChunks.contains(chunk)) {
            nextUpdate.addSnake(chunk.getSnake());
        } else {
            nextUpdate.addSnakeChunk(chunk);
            if (chunk.isFull()) {
                knownSnakeChunks.add(chunk);
            }
        }
    }

    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {}

    public void sendUpdate() {
        var update = this.nextUpdate;
        this.nextUpdate = new GameUpdate();
        onBeforeUpdateBufferIsCreated(update);
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
