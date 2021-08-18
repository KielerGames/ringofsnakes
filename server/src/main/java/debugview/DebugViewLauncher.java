package debugview;

import server.SnakeServer;

public class DebugViewLauncher {
    public static void main(String[] args){

        DebugView debugView = new DebugView();
        Thread testClientThread = new Thread((debugView));
        testClientThread.start();

        SnakeServer serverThread = new SnakeServer();
        serverThread.run();

    }
}
