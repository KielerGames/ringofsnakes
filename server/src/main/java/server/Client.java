package server;

import game.snake.FinalSnakeChunk;
import game.snake.SnakeChunk;
import game.world.WorldChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.stream.Collectors;

public abstract class Client {
    public final Session session;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownFoodChunks = new HashMap<>();
    private GameUpdate nextUpdate;

    public Client(Session session) {
        this.session = session;
        nextUpdate = new GameUpdate();
    }

    public void updateClientSnakeChunk(SnakeChunk chunk) {
        // TODO Kilian: remove instanceof check
        if(chunk instanceof FinalSnakeChunk) {
            if(((FinalSnakeChunk) chunk).isJunk()) {
                return;
            }
        }
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
        final int knownVersion = knownFoodChunks.getOrDefault(chunk, -1);
        if (knownVersion != chunk.getFoodVersion()) {
            nextUpdate.addFoodChunk(chunk);
        }
        knownFoodChunks.put(chunk, chunk.getFoodVersion());
    }

    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
    }

    public void sendUpdate() {
        var update = this.nextUpdate;
        this.nextUpdate = new GameUpdate();
        onBeforeUpdateBufferIsCreated(update);
        send(update.createUpdateBuffer());
    }

    public void send(ByteBuffer binaryData) {
        if (session.isOpen()) {
            session.getAsyncRemote().sendBinary(binaryData);
        }
    }

    public void send(String textData) {
        if (session.isOpen()) {
            session.getAsyncRemote().sendText(textData);
        }
    }

    public boolean sendSync(String textData) {
        if (session.isOpen()) {
            try {
                session.getBasicRemote().sendText(textData);
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }

        return true;
    }

    public abstract BoundingBox getKnowledgeBox();

    public void cleanupKnowledge() {
        final var knowledgeBox = getKnowledgeBox();
        final var chunksToForget = knownFoodChunks.keySet().stream()
                .filter(chunk -> !BoundingBox.intersect(knowledgeBox, chunk.box))
                .collect(Collectors.toList());

        chunksToForget.forEach(chunk -> knownFoodChunks.remove(chunk));
    }
}
