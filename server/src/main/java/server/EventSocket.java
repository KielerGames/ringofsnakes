package server;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.nio.ByteBuffer;

@ClientEndpoint
@ServerEndpoint(value = "/game")
public class EventSocket {
    private static final Logger LOGGER = LoggerFactory.getLogger(EventSocket.class);
    @OnOpen
    public void onWebSocketConnect(Session session) {
        LOGGER.debug("Socket Connected: {}", session);
        SnakeServer.onNewClientConnected(session);

        //session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Thanks"));
    }

    @OnMessage
    public void onWebSocketText(Session session, String message) {
        LOGGER.error("Unexpected text message from client {}.", session.getId());
    }

    @OnMessage
    public void onWebSocketMessage(Session session, ByteBuffer buffer) {
        if(buffer.capacity() != 9) {
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
