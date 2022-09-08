package server.clients;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.world.HeatMap;
import game.world.WorldChunk;
import math.BoundingBox;
import server.protocol.GameUpdate;
import server.protocol.SnakeNameUpdate;

import java.util.*;
import java.util.function.Supplier;

public final class ClientKnowledge {
    private final Supplier<BoundingBox> boxSupplier;
    private final Set<SnakeChunk> knownSnakeChunks = Collections.newSetFromMap(new WeakHashMap<>());
    private final Map<WorldChunk, Integer> knownFoodChunks = new HashMap<>();
    private final Map<Snake, Integer> knownSnakes = new HashMap<>();
    private long lastHeatMapUpdate = System.currentTimeMillis();
    private GameUpdate nextGameUpdate = new GameUpdate();
    private SnakeNameUpdate nextNameUpdate = new SnakeNameUpdate();

    ClientKnowledge(Supplier<BoundingBox> knowledgeBoxSupplier) {
        boxSupplier = knowledgeBoxSupplier;
    }

    public void addSnakeChunk(SnakeChunk chunk) {
        if (chunk.isJunk() || knownSnakeChunks.contains(chunk)) {
            // client knows this chunk already but should still
            // receive updates about the snake it would have gotten
            // if this chunk was part of the update
            addSnake(chunk.getSnake());
            return;
        }

        nextGameUpdate.addSnakeChunk(chunk);

        if (chunk.isFull()) {
            // full/final chunks don't require updates anymore
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

    public void addFoodChunk(WorldChunk chunk) {
        final int knownVersion = knownFoodChunks.getOrDefault(chunk, -1);
        if (knownVersion != chunk.getFoodVersion()) {
            nextGameUpdate.addFoodChunk(chunk);
        }
        knownFoodChunks.put(chunk, chunk.getFoodVersion());
    }

    public void updateHeatMap(HeatMap heatMap) {
        final long now = System.currentTimeMillis();
        final long elapsed = now - lastHeatMapUpdate;
        if (elapsed >= 1000) {
            nextGameUpdate.addHeatMap(heatMap);
            lastHeatMapUpdate = now;
        }
    }

    void update(GameUpdate update) {
        final var knowledgeBox = boxSupplier.get();

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

    public GameUpdate createNextGameUpdate(byte ticksSinceLastUpdate) {
        // swap nextGameUpdate
        final var update = this.nextGameUpdate;
        this.nextGameUpdate = new GameUpdate();

        update.setTicksSinceLastUpdate(ticksSinceLastUpdate);
        update(update); // TODO remove?

        return update;
    }

    public SnakeNameUpdate createNextNameUpdate() {
        final var update = this.nextNameUpdate;
        this.nextNameUpdate = new SnakeNameUpdate();
        return update;
    }
}
