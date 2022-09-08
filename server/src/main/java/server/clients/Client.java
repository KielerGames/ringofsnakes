package server.clients;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.HeatMap;
import game.world.WorldChunk;
import lombok.Getter;
import math.BoundingBox;
import server.protocol.GameUpdate;
import util.JSON;

import javax.annotation.Nullable;
import javax.websocket.Session;
import java.nio.ByteBuffer;

/**
 * Player/Spectator abstraction.
 */
public abstract class Client {
    public final Session session;
    private final long creationTime = System.currentTimeMillis();
    protected final ClientKnowledge knowledge;
    protected float viewBoxRatio = 1f;
    @Getter
    @Nullable
    protected Snake snake;

    protected Client(Session session, @Nullable Snake snake) {
        this.session = session;
        this.snake = snake;
        this.knowledge = new ClientKnowledge(this::getKnowledgeBox);
    }

    protected Client(Session session, ClientKnowledge knowledge, @Nullable Snake snake) {
        this.session = session;
        this.snake = snake;
        this.knowledge = knowledge;
        knowledge.setBoxSupplier(this::getKnowledgeBox);
    }

    public void updateClientSnakeChunk(SnakeChunk chunk) {
        knowledge.addSnakeChunk(chunk);
    }


    public void updateClientFoodChunk(WorldChunk chunk) {
        knowledge.addFoodChunk(chunk);
    }

    /**
     * Inform client about updated heat map. This will not always cause a heat map update
     * to be sent to the client as this implementation performs throttling.
     * Therefore, this method can be safely called once per tick.
     */
    public void updateHeatMap(HeatMap heatMap) {
        knowledge.updateHeatMap(heatMap);
    }

    /**
     * Send a binary update containing information added by previous calls to
     * - {@link #updateClientSnakeChunk(SnakeChunk)}
     * - {@link #updateClientFoodChunk(WorldChunk)}
     * - {@link #updateHeatMap(HeatMap)}
     * to the client via a websocket connection.
     */
    public final void sendGameUpdate(byte ticksSinceLastUpdate) {
        final var update = knowledge.createNextGameUpdate(ticksSinceLastUpdate);
        if (snake != null) {
            update.addSnakeChunk(snake.currentChunk);
        }
        onBeforeUpdateBufferIsCreated(update);
        send(update.createUpdateBuffer());
    }

    public void sendNameUpdate() {
        final var update = knowledge.createNextNameUpdate();
        if (update.isEmpty()) {
            return;
        }
        final var encodedUpdate = JSON.stringify(update);
        send(encodedUpdate);
    }

    protected void send(ByteBuffer binaryData) {
        if (session.isOpen()) {
            session.getAsyncRemote().sendBinary(binaryData);
        }
    }

    public void send(String textData) {
        if (session.isOpen()) {
            session.getAsyncRemote().sendText(textData);
        }
    }

    /**
     * The knowledge box is the area that the client should receive updates about, including
     * <ul>
     *     <li>{@code SnakeChunk}s</li>
     *     <li>snake meta info</li>
     *     <li>food chunks</li>
     * </ul>
     * It should be slightly larger than what the client can see on their screen.
     */
    public abstract BoundingBox getKnowledgeBox();

    public void setViewBoxRatio(float ratio) {
        assert (ratio > 0f && ratio < 3f);
        viewBoxRatio = ratio;
    }

    public int getAgeInSeconds() {
        final var now = System.currentTimeMillis();
        assert now >= creationTime;
        return (int) ((now - creationTime) / 1000);
    }

    /**
     * Hook for testing.
     */
    protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
    }
}
