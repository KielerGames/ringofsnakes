package server;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.WorldChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

/**
 * Player/Spectator abstraction.
 */
public abstract class Client {
    public final Session session;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownFoodChunks = new HashMap<>();
    private final Map<Snake, Integer> knownSnakes = new HashMap<>();
    protected float viewBoxRatio = 1f;
    private GameUpdate nextUpdate = new GameUpdate();

    public Client(Session session) {
        this.session = session;
    }

    public void updateClientSnakeChunk(SnakeChunk chunk) {
        if (chunk.isJunk()) {
            return;
        }

        if (knownSnakeChunks.contains(chunk)) {
            updateClientSnake(chunk.getSnake());
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

    private void updateClientSnake(Snake snake) {
        knownSnakes.put(snake, 0);
        nextUpdate.addSnake(snake);
    }

    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
        // removeIf is used to efficiently iterate over, modify and remove entries from knownSnakes
        knownSnakes.entrySet().removeIf(entry -> {
            final var updateContainsSnake = update.hasSnake(entry.getKey());
            final int decay = updateContainsSnake ? 0 : entry.getValue() + 1;

            if (decay > 5) {
                /*
                The client would not have received any updates about this snake within the last 5 updates.
                Thus, we can "safely" exclude it from further updates.
                */
                return true;
            }

            // keep snake with updated knowledge-decay value
            entry.setValue(decay);
            if (!updateContainsSnake) {
                update.addSnake(entry.getKey());
            }
            return false;
        });
    }

    public void sendUpdate(byte ticksSinceLastUpdate) {
        final var update = this.nextUpdate;
        update.setTicksSinceLastUpdate(ticksSinceLastUpdate);
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

    public void sendSync(String textData) {
        if (session.isOpen()) {
            try {
                session.getBasicRemote().sendText(textData);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public abstract BoundingBox getKnowledgeBox();

    public void cleanupKnowledge() {
        final var knowledgeBox = getKnowledgeBox();

        // remove old or invisible chunks
        knownFoodChunks.keySet().removeIf(chunk -> !BoundingBox.intersect(knowledgeBox, chunk.box));
        knownSnakeChunks.removeIf(chunk -> chunk.isJunk() || !BoundingBox.intersect(knowledgeBox, chunk.getBoundingBox()));
    }

    public void setViewBoxRatio(float ratio) {
        assert (ratio > 0f && ratio < 3f);
        viewBoxRatio = ratio;
    }
}
