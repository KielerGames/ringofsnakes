package server.endpoints;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

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

    }
}
