package server.recording;

import javafx.application.Platform;
import javafx.stage.FileChooser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.*;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

public class PlaybackController {
    private static final Logger LOGGER = LoggerFactory.getLogger(PlaybackController.class);
    private static PlaybackController instance;
    private final ClientDataRecording recording;
    private Iterator<ClientDataRecording.WebsocketMessage> messageIterator;
    private final Set<Session> clients = new HashSet<>();

    private PlaybackController(ClientDataRecording recording) {
        this.recording = recording;
        this.messageIterator = this.recording.iterator();
    }

    public static void initialize() {
        instance = null;
        final var file = selectFile();
        if (file == null) {
            LOGGER.warn("No file selected.");
            System.exit(0);
        }
        LOGGER.debug("Loading recording: {}", file.getName());
        final var recording = deserialize(file);
        LOGGER.debug("Loading successful.");
        instance = new PlaybackController(recording);
    }

    public static PlaybackController getInstance() {
        if (instance == null) {
            throw new RuntimeException("No playback instance available.");
        }
        return instance;
    }

    public void sendNextMessage() {
        assert messageIterator != null;

        if (!messageIterator.hasNext()) {
            // Restart recording.
            // TODO: send end message
            messageIterator = recording.iterator();
            assert messageIterator.hasNext();
        }

        final var message = messageIterator.next();
        clients.forEach(message::resend);
    }

    public void addClient(Session session) {
        synchronized (clients) {
            clients.add(session);
        }
    }

    public void removeClient(Session session) {
        synchronized (clients) {
            clients.remove(session);
        }
    }

    private static File selectFile() {
        final var future = new CompletableFuture<File>();
        // TODO: Fix of "Unsupported JavaFX configuration" warning
        Platform.startup(() -> {
            FileChooser fileChooser = new FileChooser();
            future.complete(fileChooser.showOpenDialog(null));
        });
        final var file = future.join();
        Platform.exit();
        return file;
    }

    private static ClientDataRecording deserialize(File file) {
        try {
            final var fileInputStream = new FileInputStream(file);
            final var objectInputStream = new ObjectInputStream(fileInputStream);
            final ClientDataRecording recording = (ClientDataRecording) objectInputStream.readObject();
            objectInputStream.close();
            return recording;
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
