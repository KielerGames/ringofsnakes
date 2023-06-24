package server.recording;

import javax.websocket.Session;
import java.util.Iterator;

public class PlaybackController {
    private ClientDataRecording recording;
    private Session session;
    private Iterator<ClientDataRecording.WebsocketMessage> messageIterator;

    private void init(Session session, ClientDataRecording recording) {
        this.recording = recording;
        this.session = session;
        this.messageIterator = this.recording.iterator();
    }

    private void sendNextMessage() {
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
