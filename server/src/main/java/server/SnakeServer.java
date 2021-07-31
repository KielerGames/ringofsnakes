package server;

import game.Game;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;

import javax.websocket.Session;
import javax.websocket.server.ServerEndpointConfig;
import java.util.HashMap;
import java.util.Map;

public class SnakeServer {
    @SuppressWarnings("FieldMayBeFinal")
    private static Game game = new Game();
    private final static Map<String, Player> players = new HashMap<>(64);

    public static void main(String[] args) {
        Server server = new Server();
        ServerConnector connector = new ServerConnector(server);
        connector.setPort(8080);
        server.addConnector(connector);

        // Set up the basic application "context" for this application at "/"
        // This is also known as the handler tree (in jetty speak)
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

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
            game.start();
            server.join();
        } catch (Throwable t) {
            t.printStackTrace(System.err);
        }
    }

    public static void onNewClientConnected(Session session) {
        System.out.println("A new client has connected.");
        var player = game.createPlayer(session);

        players.put(session.getId(), player);
    }

    public static void removePlayer(Session session) {
        var sessionId = session.getId();
        players.remove(sessionId);
        game.removeClient(sessionId);
        System.out.println("Player has been removed. (" + sessionId + ")");
    }

    public static void onUserInputUpdate(Session session, float alpha, boolean fast) {
        var player = players.get(session.getId());

        if(player != null) {
            player.snake.setTargetDirection(alpha);
            player.snake.setFast(fast);
        } else {
            System.err.println("Illegal request from client.");
        }
    }
}
