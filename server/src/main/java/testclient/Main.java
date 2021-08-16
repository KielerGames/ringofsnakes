package testclient;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application{
    @Override
    public void start(Stage primaryStage) throws Exception {
        primaryStage.setTitle("Hello JavaFx!");

        primaryStage.show();
    }
    public static void main(String[] args) {
        Application.launch(args);
    }
}
