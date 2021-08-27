package server;

import game.snake.SnakeChunk;
import game.world.WorldChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

public class Client {
    public final Session session;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownWorldChunks = new HashMap<>();
    private GameUpdate nextUpdate;

    public Client(Session session) {
        this.session = session;
        nextUpdate = new GameUpdate();
    }

    public void updateClientSnakeChunk(SnakeChunk chunk) {
        if (knownSnakeChunks.contains(chunk)) {
            nextUpdate.addSnake(chunk.getSnake());
        } else {
            nextUpdate.addSnakeChunk(chunk);
            if (chunk.isFull()) {
                knownSnakeChunks.add(chunk);
            }
        }
    }

    public void updateClientFoodChunk(WorldChunk chunk) {
        int knownVersion = knownWorldChunks.getOrDefault(chunk, -1);
        if(knownVersion < 0 || knownVersion < chunk.getVersion()) {
            nextUpdate.addFoodChunk(chunk);
        }
    }

    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {}

    public void sendUpdate() {
        var update = this.nextUpdate;
        this.nextUpdate = new GameUpdate();
        onBeforeUpdateBufferIsCreated(update);
        send(update.createUpdateBuffer());
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

    public BoundingBox getKnowledgeBox() {
        //TODO
        return new BoundingBox(0.0, 0.0, 0.0, 0.0);
    }
}
