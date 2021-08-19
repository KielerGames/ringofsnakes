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
import server.SnakeServer;


public class DebugView extends Application {

    private static final double zoom = 4.0;
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
            public void handle(long now) {
                if (game != null && game.snakes.size() != 0) {
                    drawSnakes(ctx);
                    drawFood(ctx);
                }
            }
        };
        t.start();
        primaryStage.show();
    }

    private void drawFood(GraphicsContext g) {
        g.setFill(Color.RED);
        g.setStroke(Color.RED);
        game.world.chunks.findChunk(game.snakes.get(0).getHeadPosition())
                .getFoodList().forEach(food -> g.fillOval(
                        food.position.x * zoom + 400, 300 - food.position.y * zoom, 2 * zoom, 2 * zoom));

    }

    private void drawSnakes(GraphicsContext g) {
        double x = game.snakes.get(0).getHeadPosition().x;
        double y = game.snakes.get(0).getHeadPosition().y;

        g.setFill(Color.BLACK);
        g.setStroke(Color.BLACK);
        g.fillOval(x * zoom + 400, 300 - y * zoom, 3 * zoom, 3 * zoom);
    }
}


