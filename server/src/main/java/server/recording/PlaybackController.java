package server.recording;

import javax.websocket.Session;
import java.util.Iterator;

public class PlaybackController {
    private static PlaybackController instance;
    private ClientDataRecording recording;
    private Iterator<ClientDataRecording.WebsocketMessage> messageIterator;

    private PlaybackController(ClientDataRecording recording) {
        this.recording = recording;
        this.messageIterator = this.recording.iterator();
    }

    public static PlaybackController create() {
        instance = null;
        return instance;
    }

    public static PlaybackController getInstance() {
        return instance;
    }

    public void sendNextMessage(Session session) {
        assert messageIterator != null;

        if (!messageIterator.hasNext()) {
            // Restart recording.
            // TODO: send end message
            messageIterator = recording.iterator();
            assert messageIterator.hasNext();
        }

        final var message = messageIterator.next();
        message.resend(session);
    }
}
