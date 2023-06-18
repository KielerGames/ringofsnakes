package game.ai.bot;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.snake.SnakeNameGenerator;
import game.world.World;
import game.world.WorldChunk;
import lombok.Getter;
import math.Direction;
import math.Vector;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static math.Direction.TAU;

public abstract class Bot {
    protected final static Random random = new Random();
    protected static final double keepThisDistanceToMapEdge = 40;
    protected final World world;
    @Getter private final Snake snake;

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
        final var worldChunk = world.chunks.findChunk(snake.getHeadPosition());

        final var otherSnakes = new HashSet<>(worldChunk.getSnakes());
        worldChunk.neighbors.forEach(c -> otherSnakes.addAll(c.getSnakes()));
        otherSnakes.remove(snake);
        otherSnakes.removeIf(s -> Vector.distance2(head, s.getHeadPosition()) <= bound);

        return otherSnakes;
    }

    /**
     * Get {@link SnakeChunk}s in the current {@link game.world.WorldChunk}
     * and its neighbors, excluding chunks from the snake of this bot and those
     * whose bounding box does not intersect with the circle defined by the given radius.
     *
     * @param radius search radius, should not be too big
     * @return A modifiable set of SnakeChunks
     */
    protected Set<SnakeChunk> getSnakeChunksInVicinity(double radius) {
        assert radius > 0.0;
        assert radius < 2.0 * world.getConfig().chunks.size;

        final var head = snake.getHeadPosition();
        final var worldChunk = world.chunks.findChunk(snake.getHeadPosition());

        return Stream.concat(Stream.of(worldChunk), worldChunk.neighbors.stream())
                .flatMap(WorldChunk::streamSnakeChunks)
                .filter(snakeChunk -> snakeChunk.getSnake() != snake)
                .filter(snakeChunk -> snakeChunk.getBoundingBox().isWithinRange(head, radius))
                .collect(Collectors.toSet());
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
