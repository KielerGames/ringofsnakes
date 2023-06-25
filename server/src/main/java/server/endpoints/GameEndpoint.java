package server.endpoints;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import server.SnakeServer;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.nio.ByteBuffer;
import java.util.Objects;

@ClientEndpoint
@ServerEndpoint(value = "/game")
public class GameEndpoint {
    private static final Logger LOGGER = LoggerFactory.getLogger(GameEndpoint.class);

    @OnOpen
    public void onWebSocketConnect(Session session) {
        LOGGER.debug("Socket Connected: {}", session);
        SnakeServer.onNewClientConnected(session);

        //session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Thanks"));
    }

    @OnMessage
    public void onWebSocketText(Session session, String message) {
        if (Objects.equals(message, "start-recording")) {
            SnakeServer.getClient(session).startRecording();
            return;
        } else if (Objects.equals(message, "stop-recording")) {
            final var recording = SnakeServer.getClient(session).stopRecording();
            recording.saveAsFile();
            return;
        }
        LOGGER.error("Unexpected text message from client {}.", session.getId());
    }

    @OnMessage
    public void onWebSocketMessage(Session session, ByteBuffer buffer) {
        if (buffer.capacity() != 9) {
            LOGGER.error("Illegal binary message from client.");
            return;
        }

        float viewBoxRatio = buffer.getFloat(0);
        float alpha = buffer.getFloat(4);
        boolean fast = buffer.get(8) != 0;

        if (Float.isFinite(alpha) && Float.isFinite(viewBoxRatio)) {
            SnakeServer.handleClientMessage(session, alpha, fast, viewBoxRatio);
        } else {
            LOGGER.warn("Client message ignored (infinite value).");
        }
    }

    @OnClose
    public void onWebSocketClose(Session session, CloseReason reason) {
        LOGGER.debug("Socket Closed: " + reason);
        SnakeServer.removeClient(session);
    }

    @OnError
    public void onWebSocketError(Throwable cause) {
        LOGGER.error("Websocket error", cause);
    }
}
