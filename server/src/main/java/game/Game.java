package game;

import com.google.gson.Gson;
import debugview.DebugView;
import game.ai.StupidBot;
import game.ai.Bot;
import game.snake.Snake;
import game.snake.SnakeFactory;
import game.world.Food;
import game.world.World;
import game.world.WorldChunk;
import math.Vector;
import server.Client;
import server.Player;
import server.protocol.SpawnInfo;
import util.ExceptionalExecutorService;
import javax.websocket.Session;
import java.util.*;

public class Game {
    private static final Gson gson = new Gson();
    public final int id = 1; //TODO
    public final GameConfig config;
    public final World world;
    private final ScheduledExecutorService executor;
    private final Map<String, Client> clients = new HashMap<>(64);
    public List<Snake> snakes = new LinkedList<>();
    private List<Bot> bots = new LinkedList<>();

    public Game() {
        config = new GameConfig();
        world = new World(config);
        executor = new ExceptionalExecutorService();

        // spawn some food
        for (int i = 0; i < 42; i++) {
            world.spawnFood();
        }

        DebugView.setGame(this);
    }

    public Player createPlayer(Session session) {
        var spawnPos = world.findSpawnPosition();
        var snake = SnakeFactory.createSnake(spawnPos, world);
        snakes.add(snake);
        world.addSnake(snake);

        var player = new Player(snake, session);
        clients.put(session.getId(), player);
        var data = gson.toJson(new SpawnInfo(config, snake));
        player.sendSync(data);
        addBotsNextToPlayerOne(25.0, 30);
        return player;
    }

    public void addBotsNextToPlayerOne(Double radius, int n) {
        //adds n stupid bots next to the player at the start of the game
        Random random = new Random();
        if (!snakes.isEmpty()) {
            var position = snakes.get(0).getHeadPosition().clone();
            for (int i = 0; i < n; i++) {
                var spawnPosition = new Vector(position.x + (random.nextDouble() * 2 - 1.0) * radius,
                        position.y + (random.nextDouble() * 2 - 1.0) * radius);
                StupidBot bot = new StupidBot(this, spawnPosition);
                snakes.add(bot.getSnake());
                bots.add(bot);
                System.out.println("Bot added!");
            }
        }
    }

    public void removeClient(String sessionId) {
        var client = clients.remove(sessionId);
        if (client instanceof Player) {
            var snake = ((Player) client).snake;
            // TODO: generate food (?), consider changing list to another data structure
            snakes.remove(snake);
        }
    }

    public void start() {
        executor.scheduleAtFixedRate(() -> {
            tick();
            updateClients();
        }, 0, (long) (1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            synchronized (this) {
                world.spawnFood();
            }
        }, 100, (long) (25 * 1000 * config.tickDuration), TimeUnit.MILLISECONDS);

        executor.scheduleAtFixedRate(() -> {
            if (!snakes.isEmpty()) {
                var snake = snakes.get(0);
                var worldChunk = world.chunks.findChunk(snake.getHeadPosition());
                System.out.println(worldChunk + ": amount of food: " + worldChunk.getFoodCount());
            }
        }, 0, 5, TimeUnit.SECONDS);

        System.out.println("Game started. Config:\n" + gson.toJson(config));


    }


    private void tick() {
        synchronized (this) {
            snakes.forEach(snake -> {
                if (snake.isAlive && !snake.collided) {
                    snake.tick();
                    killDesertingSnakes(snake);
                }
            });
            world.chunks.forEach(WorldChunk::removeOldSnakeChunks);
            bots.forEach(Bot::act);
            checkForCollisions();
        }
        eatFood();
    }


    private void checkForCollisions() {
        snakes.forEach(snake -> world.chunks.findChunk(snake.getHeadPosition()).checkForPotentialCollisions(snake));
    }

    private void updateClients() {
        clients.forEach((id, client) -> {
            final var worldChunks = world.chunks.findIntersectingChunks(client.getKnowledgeBox());
            worldChunks.stream().flatMap(WorldChunk::streamSnakeChunks).forEach(client::updateClientSnakeChunk);
            worldChunks.forEach(client::updateClientFoodChunk);
            client.sendUpdate();
            client.cleanupKnowledge();
        });
    }

    private void eatFood() {
        snakes.forEach(snake -> {
            var snakeWidth = snake.getWidth();
            var headPosition = snake.getHeadPosition();
            var worldChunk = world.chunks.findChunk(headPosition);
            var foodList = worldChunk.getFoodList();
            var collectedFood = foodList.stream()
                    .filter(food -> food.isWithinRange(headPosition, snakeWidth * 1.1 + 1.0))
                    .collect(Collectors.toList());
            snake.grow(collectedFood.size() * Food.nutritionalValue);

            synchronized (this) {
                worldChunk.removeFood(collectedFood);
            }
        });
    }

    private void killDesertingSnakes(Snake s) {
        if (Math.abs(s.getHeadPosition().x) > world.width / 2.0 - 3 || Math.abs(s.getHeadPosition().y) > world.height / 2.0 - 3) {
            System.out.println("Removing Snake " + s.id + " from Game, because it is leaving the map.");
            s.isAlive = false;
        }
    }
}
