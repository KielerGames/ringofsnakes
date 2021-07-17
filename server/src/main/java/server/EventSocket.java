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
        float alpha = (float) buffer.getDouble(0); // TODO
        boolean fast = buffer.get(8) != 0;
        assert(buffer.get(9) == 42);
        SnakeServer.onUserInputUpdate(session, alpha, fast);
    }

    @OnClose
    public void onWebSocketClose(Session session, CloseReason reason) {
        System.out.println("Socket Closed: " + reason);
        SnakeServer.removePlayer(session);
    }

    @OnError
    public void onWebSocketError(Throwable cause) {
        cause.printStackTrace(System.err);
    }
}
