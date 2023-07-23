package server;

import lombok.Getter;
import org.apache.commons.cli.CommandLine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ServerSettings {
    private static final Logger LOGGER = LoggerFactory.getLogger(ServerSettings.class);

    @Getter private static boolean recordingEnabled;

    public static void initialize(CommandLine cmd) {
        if (cmd.hasOption("enable-recording")) {
            recordingEnabled = true;
            LOGGER.info("Recording enabled.");
        }
    }
}
