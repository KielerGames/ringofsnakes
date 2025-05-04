package util;

import javafx.application.Platform;
import javafx.stage.FileChooser;

import java.io.File;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

public final class FileUtilities {
    public static File selectFileToOpen(String title) {
        return chooseFile(fileChooser -> {
            fileChooser.setTitle(title);
            return fileChooser.showOpenDialog(null);
        });
    }

    public static File selectFileToSaveTo(String title) {
        return chooseFile((fileChooser) -> {
            fileChooser.setTitle(title);
            return fileChooser.showSaveDialog(null);
        });
    }

    private static File chooseFile(Function<FileChooser, File> function) {
        final var future = new CompletableFuture<File>();

        JavaFXPlatformManager.run(() -> {
            final var fileChooser = new FileChooser();
            final var file = function.apply(fileChooser);
            future.complete(file);
        });

        return future.join();
    }
}
