import org.apache.commons.cli.*;
import server.SnakeServer;
import server.recording.PlaybackController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.LogManager;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        initializeLogging();
        final var cmd = getCommandLine(args);

        if (cmd.hasOption("playback")) {
            new PlaybackController();
            // TODO
            return;
        }

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

    private static CommandLine getCommandLine(String[] args) {

        final var options = new Options();
        options.addOption("playback", false, "Switch to playback mode.");

        try {
            return new DefaultParser().parse(options, args);
        } catch (ParseException e) {
            System.err.println(e.getMessage());
            new HelpFormatter().printHelp("server", options);

            System.exit(1);
            return null;
        }
    }
}
