package testclient;

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
