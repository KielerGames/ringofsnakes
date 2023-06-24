package server.endpoints;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import server.recording.PlaybackController;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.util.Objects;

@ClientEndpoint
@ServerEndpoint(value = "/playback")
public class PlaybackEndpoint {
    private static final Logger LOGGER = LoggerFactory.getLogger(PlaybackEndpoint.class);

    @OnOpen
    public void onWebSocketConnect(Session session) {
        LOGGER.debug("Playback socket connection opened.");
    }

    @OnMessage
    public void onWebSocketText(Session session, String message) {
        final var playback = PlaybackController.getInstance();

        if (Objects.equals("next", message)) {
            playback.sendNextMessage(session);
            return;
        }

        throw new IllegalArgumentException(String.format("Received unknown message '%s'", message));
    }
}
