package server.client;

import com.google.gson.Gson;
import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.HeatMap;
import game.world.WorldChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;
import server.protocol.SnakeNameUpdate;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

/**
 * Player/Spectator abstraction.
 */
public abstract class Client {
    private static final Gson gson = new Gson();
    public final Session session;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownFoodChunks = new HashMap<>();
    private final Map<Snake, Integer> knownSnakes = new HashMap<>();
    protected float viewBoxRatio = 1f;
    private GameUpdate nextGameUpdate = new GameUpdate();
    private long lastHeatMapUpdate = System.currentTimeMillis();
    private SnakeNameUpdate nextNameUpdate = new SnakeNameUpdate();

    public Client(Session session) {
        this.session = session;
    }

    /**
     * Include a {@link SnakeChunk} in the next update.
     * This will also add the corresponding snake to that update.
     * Junk chunks will be ignored.
     */
    public void updateClientSnakeChunk(SnakeChunk chunk) {
        if (chunk.isJunk() || knownSnakeChunks.contains(chunk)) {
            // client knows this chunk already but should still
            // receive updates about the snake it would have gotten
            // if this chunk was part of the update
            updateClientSnake(chunk.getSnake());
            return;
        }

        nextGameUpdate.addSnakeChunk(chunk);

        if (chunk.isFull()) {
            // full/final chunks don't require updates anymore
            knownSnakeChunks.add(chunk);
        }
    }

    /**
     * Add this food chunk to the next update if
     * - the client does not know it already or
     * - the food chunk contains changes not yet known by the client
     */
    public void updateClientFoodChunk(WorldChunk chunk) {
        final int knownVersion = knownFoodChunks.getOrDefault(chunk, -1);
        if (knownVersion != chunk.getFoodVersion()) {
            nextGameUpdate.addFoodChunk(chunk);
        }
        knownFoodChunks.put(chunk, chunk.getFoodVersion());
    }

    /**
     * Add a snake to the next update that gets sent to the client.
     */
    private void updateClientSnake(Snake snake) {
        // reset knowledge-decay
        final var previousValue = knownSnakes.put(snake, 0);
        nextGameUpdate.addSnake(snake);

        if (previousValue == null) {
            this.nextNameUpdate.addNameOf(snake);
        }
    }

    /**
     * Inform client about updated heat map. This will not always cause a heat map update
     * to be sent to the client as this implementation performs throttling.
     * Therefore, this method can be safely called once per tick.
     */
    public void updateHeatMap(HeatMap heatMap) {
        final long now = System.currentTimeMillis();
        final long elapsed = now - lastHeatMapUpdate;
        if (elapsed >= 1000) {
            nextGameUpdate.addHeatMap(heatMap);
            lastHeatMapUpdate = now;
        }
    }

    /**
     * A hook that gets called right before the given update instance gets
     * turned into a byte buffer for transfer to the client.
     */
    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {

    }

    /**
     * Send a binary update containing information added by previous calls to
     * - {@link #updateClientSnake(Snake)}
     * - {@link #updateClientSnakeChunk(SnakeChunk)}
     * - {@link #updateClientFoodChunk(WorldChunk)}
     * - {@link #updateHeatMap(HeatMap)}
     * to the client via a websocket connection.
     */
    public final void sendGameUpdate(byte ticksSinceLastUpdate) {
        final var update = this.nextGameUpdate;
        update.setTicksSinceLastUpdate(ticksSinceLastUpdate);
        this.nextGameUpdate = new GameUpdate();
        updateKnowledge(update);
        onBeforeUpdateBufferIsCreated(update);
        send(update.createUpdateBuffer());
    }

    public void sendNameUpdate() {
        if (this.nextNameUpdate.isEmpty()) {
            return;
        }
        final var encodedUpdate = gson.toJson(this.nextNameUpdate);
        this.nextNameUpdate = new SnakeNameUpdate();
        send(encodedUpdate);
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

    private void updateKnowledge(GameUpdate update) {
        final var knowledgeBox = getKnowledgeBox();

        // update knownSnakes based on the given update instance
        // removeIf is used to efficiently iterate over, modify and remove entries from knownSnakes
        knownSnakes.entrySet().removeIf(entry -> {
            final var updateContainsSnake = update.hasSnake(entry.getKey());
            final int newDecay = updateContainsSnake ? 0 : entry.getValue() + 1;

            if (newDecay > 5) {
                // The client would not have received any updates about this snake within the last 5 updates.
                // Thus, we can "safely" exclude it from further updates.
                return true;
            }

            // keep snake with updated knowledge-decay value
            entry.setValue(newDecay);
            if (!updateContainsSnake) {
                // the client should continue to receive updates about a known snake
                // for a short time (until knowledge decays) to avoid some problems
                update.addSnake(entry.getKey());
            }
            return false;
        });

        // remove old or invisible chunks
        knownFoodChunks.keySet().removeIf(chunk -> !BoundingBox.intersect(knowledgeBox, chunk.box));
        knownSnakeChunks.removeIf(chunk -> chunk.isJunk() || !BoundingBox.intersect(knowledgeBox, chunk.getBoundingBox()));
    }

    public void setViewBoxRatio(float ratio) {
        assert (ratio > 0f && ratio < 3f);
        viewBoxRatio = ratio;
    }
}
