package debugview;

import javafx.animation.AnimationTimer;
import javafx.application.Application;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import math.Vector;
import server.client.Player;
import server.SnakeServer;

import java.util.OptionalInt;


public class DebugView extends Application {

    private static final double ZOOM = 16.0;
    private static final boolean FOLLOW_PLAYER = true;
    private static final boolean DRAW_TAILS = true;
    private static DebugGame game;
    private Vector camera = new Vector(0, 0);

    public static void main(String[] args) {
        game = new DebugGame();

        // start game server
        new Thread(() -> {
            SnakeServer.startServerWithGame(game);
            game.start();
        }).start();

        // create debug window
        launch(args);

        // stop everything after the debug view is closed
        System.exit(0);
    }

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("SnakeRoyal Debug GUI");
        Group root = new Group();
        Canvas canvas = new Canvas(800, 600);
        GraphicsContext ctx = canvas.getGraphicsContext2D();
        root.getChildren().add(canvas);
        primaryStage.setScene(new Scene(root));

        AnimationTimer timer = new AnimationTimer() {
            @Override
            public void handle(long now) {
                game.awaitExecution(() -> {
                    ctx.clearRect(0, 0, 800, 600);

                    if (!game.snakes.isEmpty()) {
                        final var playerId = game.streamClients()
                                .filter(Player.class::isInstance)
                                .map(Player.class::cast)
                                .map(Player::getSnake)
                                .mapToInt(snake -> snake.id)
                                .findFirst();

                        drawSnakes(ctx, playerId);
                        drawFood(ctx);
                        drawCurrentWorldChunk(ctx);
                        drawSnakeChunksBoundingBoxes(ctx, playerId);
                    }
                });
            }
        };

        timer.start();
        primaryStage.show();
    }

    private void drawFood(GraphicsContext g) {
        g.setFill(Color.RED);
        g.setStroke(Color.RED);
        game.world.chunks.forEach(chunk -> chunk.streamFood().forEach(food -> {
            var size = food.size.value;
            g.fillOval((food.position.x - camera.x) * ZOOM + 400 - size * ZOOM,
                    300 - (food.position.y - camera.y) * ZOOM - size * ZOOM,
                    size * ZOOM, size * ZOOM);
        }));
    }

    private void drawSnakes(GraphicsContext g, OptionalInt playerId) {
        game.snakes.forEach(snake -> {
            g.setFill(Color.BLACK);
            g.setStroke(Color.BLACK);
            if (playerId.isPresent() && snake.id == playerId.getAsInt()) {
                g.setFill(Color.BLUE);
                g.setStroke(Color.BLUE);
                if (FOLLOW_PLAYER) {
                    camera = snake.getHeadPosition();
                }
            }

            final var snakeSize = snake.getWidth();
            final var snakeLength = snake.getLength();

            snake.streamSnakeChunks()
                    .flatMap(chunk -> chunk.getPathData().stream())
                    .filter(pd -> pd.getOffsetInSnake() < snakeLength)
                    .forEach(pd -> {
                        final var x = pd.point.x;
                        final var y = pd.point.y;
                        final float snakeScale = 1f;

                        g.fillOval((x - camera.x) * ZOOM + 400 - snakeSize / 2.0 * snakeScale * ZOOM,
                                300 - (y - camera.y) * ZOOM - snakeSize / 2.0 * snakeScale * ZOOM,
                                snakeSize * snakeScale * ZOOM, snakeSize * snakeScale * ZOOM);
                    });

            if (DRAW_TAILS) {
                g.setFill(Color.ORANGE);
                g.setStroke(Color.ORANGE);
                var tailPosition = snake.getTailPosition();
                final var x = tailPosition.x;
                final var y = tailPosition.y;
                g.fillOval((x - camera.x) * ZOOM + 400 - snakeSize * ZOOM,
                        300 - (y - camera.y) * ZOOM - snakeSize * ZOOM,
                        snakeSize * ZOOM * 1.3, snakeSize * ZOOM * 1.3);
            }
        });
    }


    private void drawCurrentWorldChunk(GraphicsContext g) {
        if (game != null && game.snakes.size() != 0) {
            var snake = game.snakes.get(0);
            var x = game.world.chunks.findChunk(snake.getHeadPosition()).box.getCenter().x;
            var y = game.world.chunks.findChunk(snake.getHeadPosition()).box.getCenter().y;
            var height = game.world.chunks.findChunk(snake.getHeadPosition()).box.getHeight();
            var width = game.world.chunks.findChunk(snake.getHeadPosition()).box.getWidth();
            g.setFill(Color.TRANSPARENT);
            g.setStroke(Color.GREEN);
            g.strokeRect((x - camera.x) * ZOOM + 400 - width / 2 * ZOOM,
                    300 - (y - camera.y) * ZOOM - height / 2 * ZOOM,
                    width * ZOOM, height * ZOOM);
        }
    }

    private void drawSnakeChunksBoundingBoxes(GraphicsContext g, OptionalInt playerId) {
        game.world.chunks.forEach(chunk -> chunk.streamSnakeChunks()
                .forEach(snakeChunk -> {
                    var boundingBox = snakeChunk.getBoundingBox();
                    var x = boundingBox.getCenter().x;
                    var y = boundingBox.getCenter().y;
                    var height = boundingBox.getHeight();
                    var width = boundingBox.getWidth();
                    g.setFill(Color.TRANSPARENT);
                    if (playerId.isPresent() && snakeChunk.getSnake().id == playerId.getAsInt()) {
                        g.setStroke(Color.BLUE);
                    } else {
                        g.setStroke(Color.BLACK);
                    }
                    g.strokeRect((x - camera.x) * ZOOM + 400 - width / 2 * ZOOM,
                            300 - (y - camera.y) * ZOOM - height / 2 * ZOOM,
                            width * ZOOM, height * ZOOM);
                }));
    }
}


