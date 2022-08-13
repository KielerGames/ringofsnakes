package game.ai;

import game.snake.Snake;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.World;
import lombok.Getter;
import math.Vector;
import util.Direction;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static util.Direction.TAU;

public abstract class Bot {
    protected final static Random random = new Random();
    protected static final double keepThisDistanceToMapEdge = 40;
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
     * excluding the snake of this bot and all snakes that are out of the given
     * search radius.
     *
     * @param radius search radius, should not be too big as this method
     *               will only consider neighboring chunks
     * @return A modifiable set of snakes
     */
    protected Set<Snake> getSnakesInVicinity(double radius) {
        assert radius > 0.0;
        assert radius < 2.0 * world.getConfig().chunks.size;

        final var bound = radius * radius;
        final var head = snake.getHeadPosition();
        final var chunk = world.chunks.findChunk(snake.getHeadPosition());

        final var otherSnakes = new HashSet<>(chunk.getSnakes());
        chunk.neighbors.forEach(c -> otherSnakes.addAll(c.getSnakes()));
        otherSnakes.remove(snake);
        otherSnakes.removeIf(s -> Vector.distance2(head, s.getHeadPosition()) <= bound);

        return otherSnakes;
    }

    protected void moveInRandomDirection() {
        final var snakeIsSafe = world.box.isWithinSubBox(snake.getHeadPosition(), keepThisDistanceToMapEdge);
        if (snakeIsSafe) {
            snake.setTargetDirection(random.nextDouble() * TAU - Math.PI);
        } else {
            moveTowardsPosition(world.center);
        }
    }

    protected void moveTowardsPosition(Vector targetPosition) {
        final var targetDirection = Direction.getFromTo(snake.getHeadPosition(), targetPosition);
        snake.setTargetDirection(targetDirection);
    }
}
