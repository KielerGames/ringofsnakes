package testclient;
/*
Q: Why does this class even exist?
A: Good question, an answer might be here: http://tutorials.jenkov.com/javafx/your-first-javafx-application.html
    not sure though, just implemented the suggested fix and did not read the reasoning yet.
 */
import server.SnakeServer;

public class LauncherHelper {
    public static void main(String[] args){

        TestClient testClient = new TestClient();
        Thread testClientThread = new Thread((testClient));
        testClientThread.start();

        SnakeServer serverThread = new SnakeServer();
        serverThread.run();

    }
}
