package testclient;
import javafx.animation.AnimationTimer;
import javafx.application.Application;
import javafx.geometry.Point2D;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

import game.Game;
import javafx.util.Duration;

import java.awt.*;


public class TestClient extends Application implements Runnable{


    private static Game game;
    public static Rectangle rect;

    @Override
    public void start(Stage primaryStage) throws Exception {
        primaryStage.setTitle("Hello JavaFx!");
        Group root = new Group();
        Canvas canvas = new Canvas(800, 600);
        GraphicsContext gc = canvas.getGraphicsContext2D();
        //drawShapes();
        root.getChildren().add(canvas);
        primaryStage.setScene(new Scene(root));



         gc.setFill(Color.BLACK);
         gc.setStroke(Color.BLACK);


        AnimationTimer t = new AnimationTimer() {
            @Override
            public void handle(long now) {
                if(game!=null && game.snakes.size() != 0){
                    double x = game.snakes.get(0).getHeadPosition().x;
                    double y = game.snakes.get(0).getHeadPosition().y;

                    gc.setFill(Color.BLACK);
                    gc.setStroke(Color.BLACK);
                    gc.fillOval(x + 400,  300 -y, 3, 3);
                    gc.setFill(Color.RED);
                    gc.setStroke(Color.RED);
                    game.world.chunks.findChunk(game.snakes.get(0).getHeadPosition())
                            .getFoodList().forEach(food -> gc.fillOval(
                                    food.position.x + 400,  300 - food.position.y, 2, 2));



                }
            }
        };
        t.start();

        primaryStage.show();
    }
    public static void main(String[] args) {
        Application.launch(args);
    }
    public static void setGame(Game g){
        game = g;
    }

    @Override
    public void run() {
        TestClient.main(null);

    }
}


