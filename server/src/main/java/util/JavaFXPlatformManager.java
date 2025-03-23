package util;

import javafx.application.Platform;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JavaFXPlatformManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(JavaFXPlatformManager.class);
    private static boolean platformStarted = false;

    /**
     * Run the runnable on the JavaFX application thread.
     */
    public static void run(Runnable runnable) {
        if (!platformStarted) {
            LOGGER.debug("Starting JavaFX platform.");
            platformStarted = true;
            Platform.startup(runnable);
            return;
        }

        Platform.runLater(runnable);
    }

    /**
     * Exit the JavaFX platform if it is running.
     */
    public static void exit() {
        if (platformStarted) {
            LOGGER.debug("Exiting JavaFX platform.");
            Platform.exit();
        }
    }
}
