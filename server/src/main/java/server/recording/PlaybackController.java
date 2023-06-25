package server.recording;

import javax.websocket.Session;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class PlaybackController {
    private static PlaybackController instance;
    private final ClientDataRecording recording;
    private Iterator<ClientDataRecording.WebsocketMessage> messageIterator;
    private final Set<Session> clients = new HashSet<>();

    private PlaybackController(ClientDataRecording recording) {
        this.recording = recording;
        this.messageIterator = this.recording.iterator();
    }

    public static PlaybackController create() {
        instance = null;
        return instance;
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
}
