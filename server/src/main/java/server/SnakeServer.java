package server;

import game.Snake;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;

import javax.websocket.Session;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;

public class SnakeServer {
    private static Map<String, Player> players = new HashMap<>();

    public static void main(String[] args) {
        Server server = new Server();
        ServerConnector connector = new ServerConnector(server);
        connector.setPort(8080);
        server.addConnector(connector);

        // Setup the basic application "context" for this application at "/"
        // This is also known as the handler tree (in jetty speak)
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

        var ticker = new Thread(new Ticker());

        try {
            // Initialize javax.websocket layer
            WebSocketServerContainerInitializer.configure(context,
                    (servletContext, wsContainer) ->
                    {
                        // This lambda will be called at the appropriate place in the
                        // ServletContext initialization phase where you can initialize
                        // and configure  your websocket container.

                        // Configure defaults for container
                        wsContainer.setDefaultMaxTextMessageBufferSize(65535);

                        // Add WebSocket endpoint to javax.websocket layer
                        wsContainer.addEndpoint(EventSocket.class);
                    });

            server.start();
            ticker.start();
            server.join();
        } catch (Throwable t) {
            t.printStackTrace(System.err);
        }
    }

    public static Snake createSnake(Session session) {
        var snake = new Snake();
        //snake.tick();
        //snake.tick();
        var player = new Player(snake, session);
        players.put(session.getId(), player);
        return snake;
    }

    public static void setDirection(Session session, double alpha) {
        var player = players.get(session.getId());
        assert player != null;
        player.session = session;
        player.snake.updateDirection(alpha);
    }

    private static class Ticker implements Runnable {
        public void run() {
            System.out.println("Ticker running...");
            while(true) {
                players.forEach((id, player) -> player.snake.tick());
                players.forEach(
                        (id, player) -> player.session.getAsyncRemote().sendBinary(
                                player.snake.getLastChunk().chunkByteBuffer)
                );
                try {
                    Thread.sleep(1000 / 60);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

        }
    }
}

class Player {
    public Snake snake;
    public Session session;

    public Player(Snake snake, Session session) {
        this.snake = snake;
        this.session = session;
    }
}