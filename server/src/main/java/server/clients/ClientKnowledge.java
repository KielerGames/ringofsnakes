package server.clients;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.HeatMap;
import game.world.WorldChunk;
import lombok.Setter;
import math.BoundingBox;
import server.protocol.GameUpdate;
import server.protocol.SnakeNameUpdate;

import java.util.*;
import java.util.function.Supplier;

public final class ClientKnowledge {
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownFoodChunks = new HashMap<>();
    private final Map<Snake, Integer> knownSnakes = new HashMap<>();
    @Setter private Supplier<BoundingBox> boxSupplier;
    private long lastHeatMapUpdate = System.currentTimeMillis();
    private GameUpdate nextGameUpdate = new GameUpdate();
    private SnakeNameUpdate nextNameUpdate = new SnakeNameUpdate();

    ClientKnowledge(Supplier<BoundingBox> knowledgeBoxSupplier) {
        boxSupplier = knowledgeBoxSupplier;
    }

    /**
     * Include a {@link SnakeChunk} in the next update.
     * This will also add the corresponding snake to that update.
     * Junk chunks will be ignored.
     */
    public void addSnakeChunk(SnakeChunk chunk) {
        if (chunk.isJunk() || knownSnakeChunks.contains(chunk)) {
            // Client knows this chunk already but should still receive updates
            // about the snake it would have gotten an update about if this chunk
            // was part of the update.
            addSnake(chunk.getSnake());
            return;
        }

        nextGameUpdate.addSnakeChunk(chunk);

        if (chunk.isFull()) {
            // Full/final chunks don't require updates anymore.
            knownSnakeChunks.add(chunk);
        }
    }

    public void addSnake(Snake snake) {
        // reset knowledge-decay
        final var previousValue = knownSnakes.put(snake, 0);
        nextGameUpdate.addSnake(snake);

        if (previousValue == null) {
            this.nextNameUpdate.addNameOf(snake);
        }
    }

    /**
     * Add this food chunk to the next update if
     * - the client does not know it already or
     * - the food chunk contains changes not yet known by the client
     */
    public void addFoodChunk(WorldChunk chunk) {
        final int knownVersion = knownFoodChunks.getOrDefault(chunk, -1);
        if (knownVersion != chunk.getFoodVersion()) {
            nextGameUpdate.addFoodChunk(chunk);
        }
        knownFoodChunks.put(chunk, chunk.getFoodVersion());
    }

    /**
     * Inform client about updated heat map. Will be included in the next {@code GameUpdate}
     * if at least a second has passed since the last {@code GameUpdate}.
     */
    public void updateHeatMap(HeatMap heatMap) {
        final long now = System.currentTimeMillis();
        final long elapsed = now - lastHeatMapUpdate;
        if (elapsed >= 1000) {
            nextGameUpdate.addHeatMap(heatMap);
            lastHeatMapUpdate = now;
        }
    }

    public GameUpdate createNextGameUpdate(byte ticksSinceLastUpdate) {
        cleanup();

        // Swap nextGameUpdate.
        final var update = this.nextGameUpdate;
        this.nextGameUpdate = new GameUpdate();

        // Finalize update.
        update.setTicksSinceLastUpdate(ticksSinceLastUpdate);
        augmentGameUpdate(update);

        return update;
    }

    public SnakeNameUpdate createNextNameUpdate() {
        final var update = this.nextNameUpdate;
        this.nextNameUpdate = new SnakeNameUpdate();
        return update;
    }

    private void augmentGameUpdate(GameUpdate update) {
        // The client should continue to receive updates about a known snake
        // for a short time (until knowledge decays) to improve client experience.
        knownSnakes.keySet().forEach(update::addSnake);
    }

    private void cleanup() {
        // Update snake knowledge decay and remove snakes that are no longer
        // relevant to the client. removeIf is used to efficiently iterate over,
        // modify and remove entries from knownSnakes.
        knownSnakes.entrySet().removeIf(entry -> {
            final var updateContainsSnake = nextGameUpdate.hasSnake(entry.getKey());
            final int newDecay = updateContainsSnake ? 0 : entry.getValue() + 1;

            if (newDecay > 5) {
                // The client would not have received any updates about this snake within the last 5 updates.
                // Thus, we can "safely" exclude it from further updates.
                return true;
            }

            // Keep snake with updated knowledge-decay value.
            entry.setValue(newDecay);
            return false;
        });

        // Remove old or invisible chunks.
        final var knowledgeBox = boxSupplier.get();
        knownFoodChunks.keySet().removeIf(chunk -> !BoundingBox.intersect(knowledgeBox, chunk.box));
        knownSnakeChunks.removeIf(chunk -> chunk.isJunk() || !BoundingBox.intersect(knowledgeBox, chunk.getBoundingBox()));
    }
}
