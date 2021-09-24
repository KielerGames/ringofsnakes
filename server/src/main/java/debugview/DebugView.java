package debugview;

import game.Game;
import javafx.animation.AnimationTimer;
import javafx.application.Application;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import math.Vector;
import server.SnakeServer;

import java.util.LinkedList;


public class DebugView extends Application {

    private static final double ZOOM = 1;
    private static final boolean FOLLOW_PLAYER = true;
    private Vector camera = new Vector(0, 0);
    private static Game game;


    public static void main(String[] args) {
        // start game server
        new Thread(() -> SnakeServer.main(null)).start();

        // create debug window
        launch(args);

        // stop everything after the debug view is closed
        System.exit(0);
    }

    public static void setGame(Game g) {
        game = g;
    }

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("SnakeRoyal Debug GUI");
        Group root = new Group();
        Canvas canvas = new Canvas(800, 600);
        GraphicsContext ctx = canvas.getGraphicsContext2D();
        root.getChildren().add(canvas);
        primaryStage.setScene(new Scene(root));

        AnimationTimer t = new AnimationTimer() {
            @Override
            @SuppressWarnings("SynchronizeOnNonFinalField")
            public void handle(long now) {
                ctx.clearRect(0, 0, 800, 600);

                if (game != null && game.snakes.size() != 0) {
                    synchronized (game) {
                        drawSnakes(ctx);
                        drawFood(ctx);
                        drawCurrentWorldChunk(ctx);
                        drawSnakeChunksBoundingBoxes(ctx);
                    }
                }
            }
        };
        t.start();
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

    private void drawSnakes(GraphicsContext g) {
        game.snakes.forEach(snake -> {
            g.setFill(Color.BLACK);
            g.setStroke(Color.BLACK);
            if (snake.id == 0) {
                g.setFill(Color.BLUE);
                g.setStroke(Color.BLUE);
                if (FOLLOW_PLAYER) {
                    camera = snake.getHeadPosition();
                }
            }
            final var snakeSize = game.snakes.get(0).getWidth();
            final var pointsToDraw = new LinkedList<>(snake.chunkBuilder.pointData);

            snake.chunks.forEach(chunk -> pointsToDraw.addAll(chunk.pointData));
            pointsToDraw.forEach(pd -> {
                var x = pd.point.x;
                var y = pd.point.y;
                g.fillOval((x - camera.x) * ZOOM + 400 - snakeSize * ZOOM,
                        300 - (y - camera.y) * ZOOM - snakeSize * ZOOM,
                        snakeSize * ZOOM, snakeSize * ZOOM);
            });
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

    private void drawSnakeChunksBoundingBoxes(GraphicsContext g) {
        game.world.chunks.forEach(chunk -> chunk.streamSnakeChunks()
                .forEach(snakeChunk -> {
                    var boundingBox = snakeChunk.getBoundingBox();
                    var x = boundingBox.getCenter().x;
                    var y = boundingBox.getCenter().y;
                    var height = boundingBox.getHeight();
                    var width = boundingBox.getWidth();
                    g.setFill(Color.TRANSPARENT);
                    if (snakeChunk.getSnake().id == 0) {
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


