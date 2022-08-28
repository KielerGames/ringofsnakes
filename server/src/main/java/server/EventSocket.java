package server;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.nio.ByteBuffer;

@ClientEndpoint
@ServerEndpoint(value = "/game")
public class EventSocket {
    @OnOpen
    public void onWebSocketConnect(Session session) {
        System.out.println("Socket Connected: " + session);

        SnakeServer.onNewClientConnected(session);

        //session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Thanks"));
    }

    @OnMessage
    public void onWebSocketText(Session session, String message) {
    }

    @OnMessage
    public void onWebSocketMessage(Session session, ByteBuffer buffer) {
        if (buffer.capacity() != 9) {
            System.err.println("Illegal binary message from client.");
            return;
        }

        float viewBoxRatio = buffer.getFloat(0);
        float alpha = buffer.getFloat(4);
        boolean fast = buffer.get(8) != 0;

        if (Float.isFinite(alpha) && Float.isFinite(viewBoxRatio)) {
            // TODO(?) make sure float values are in a valid range
            SnakeServer.onUserInputUpdate(session, alpha, fast, viewBoxRatio);
        }
    }

    @OnClose
    public void onWebSocketClose(Session session, CloseReason reason) {
        System.out.println("Socket Closed: " + reason);
        SnakeServer.removeClient(session);
    }

    @OnError
    public void onWebSocketError(Throwable cause) {
        cause.printStackTrace(System.err);
    }
}
