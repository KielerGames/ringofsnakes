package server;

import game.Snake;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Locale;
import java.util.concurrent.CountDownLatch;

@ClientEndpoint
@ServerEndpoint(value = "/game")
public class EventSocket {
    private CountDownLatch closureLatch = new CountDownLatch(1);

    @OnOpen
    public void onWebSocketConnect(Session session) {
        System.out.println("Socket Connected: " + session);

        var snake = SnakeServer.createSnake(session);

        //session.getAsyncRemote().sendBinary(snake.chunks.get(0).chunkByteBuffer);
    }

    @OnMessage
    public void onWebSocketText(Session session, String message) throws IOException {
        System.out.println("Received TEXT message: " + message);

        if (message.toLowerCase(Locale.US).contains("bye")) {
            session.close(new CloseReason(CloseReason.CloseCodes.NORMAL_CLOSURE, "Thanks"));
        }
    }

    @OnMessage
    public void onWebSocketMessage(Session session, ByteBuffer buffer) {
        double alpha = buffer.getDouble(0);
        SnakeServer.setDirection(session, alpha);
    }

    @OnClose
    public void onWebSocketClose(CloseReason reason) {
        System.out.println("Socket Closed: " + reason);
        closureLatch.countDown();
    }

    @OnError
    public void onWebSocketError(Throwable cause) {
        cause.printStackTrace(System.err);
    }

    public void awaitClosure() throws InterruptedException {
        System.out.println("Awaiting closure from remote");
        closureLatch.await();
    }
}
