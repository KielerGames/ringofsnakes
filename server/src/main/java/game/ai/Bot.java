package game.ai;

import game.snake.Snake;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.World;
import lombok.Getter;
import math.Vector;

import java.util.HashSet;
import java.util.Set;

public abstract class Bot {
    @Getter private final Snake snake;
    protected World world;

    public Bot(World world, Vector spawnPosition) {
        final var name = SnakeNameGenerator.generateBotName();
        this.world = world;
        this.snake = SnakeFactory.createSnake(spawnPosition, world, name);
    }

    public Bot(World world) {
        this(world, world.findSpawnPosition());
    }

    public boolean isAlive() {
        return snake.isAlive();
    }

    public abstract void act();

    /**
     * Get snakes in the current {@link game.world.WorldChunk} and its neighbors,
     * excluding the snake of this bot.
     * @return A modifiable set of snakes
     */
    protected Set<Snake> getSnakesInNeighborhood() {
        final var chunk = world.chunks.findChunk(snake.getHeadPosition());
        final var otherSnakes = new HashSet<>(chunk.getSnakes());
        chunk.neighbors.forEach(c -> otherSnakes.addAll(c.getSnakes()));
        otherSnakes.remove(snake);
        return otherSnakes;
    }
}
