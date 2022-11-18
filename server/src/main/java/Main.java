import server.SnakeServer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.LogManager;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        initializeLogging();
        SnakeServer.start();
    }

    private static void initializeLogging() {
        if (System.getProperties().contains("java.util.logging.config.file")) {
            return;
        }

        final var manager = LogManager.getLogManager();
        final var path = Paths.get("logging.properties").toAbsolutePath();

        if (Files.exists(path)) {
            System.out.println("Using logging config file: " + path);
            System.setProperty("java.util.logging.config.file", path.toString());
            try {
                manager.readConfiguration();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
