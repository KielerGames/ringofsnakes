package server;

import game.Game;
import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;

import javax.websocket.CloseReason;
import javax.websocket.Session;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class SnakeServer {
    private final static Map<String, Client> clients = new HashMap<>(64);
    private static final CloseReason ILLEGAL_INPUT = new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "User input not allowed as spectator.");
    private static Game game;

    public static Server startServerWithGame(Game game) {
        SnakeServer.game = game;

        Server server = new Server();

        ServerConnector wsConnector = new ServerConnector(server);
        wsConnector.setPort(8080);
        server.addConnector(wsConnector);

        addSecureConnector(server);

        // Set up the basic application "context" for this application at "/"
        // This is also known as the handler tree (in jetty speak)
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

        WebSocketServerContainerInitializer.configure(context, (servletContext, wsContainer) -> {
            // This lambda will be called at the appropriate place in the
            // ServletContext initialization phase where you can initialize
            // and configure  your websocket container.

            // Configure defaults for container
            wsContainer.setDefaultMaxTextMessageBufferSize(65535);

            // Add WebSocket endpoint to javax.websocket layer
            wsContainer.addEndpoint(EventSocket.class);
        });

        try {
            server.start();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to start jetty server.", e);
        }

        return server;
    }

    public static void main(String[] args) throws InterruptedException {
        game = new Game();
        final var server = startServerWithGame(game);
        game.start();
        server.join();
    }

    public static void onNewClientConnected(Session session) {
        System.out.println("A new client has connected.");
        Client player;
        try {
            player = game.createPlayer(session).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            // TODO: close connection
            return;
        }

        clients.put(session.getId(), player);
    }

    public static void removeClient(Session session) {
        final var sessionId = session.getId();
        clients.remove(sessionId);
        game.removeClient(sessionId);
        System.out.println("Player has been removed. (" + sessionId + ")");
    }

    public static void onUserInputUpdate(Session session, float alpha, boolean fast, float ratio) {
        final var client = clients.get(session.getId());

        if (client.isPlayer()) {
            client.getSnake().setTargetDirection(alpha);
            client.getSnake().setUserFast(fast);
            client.setViewBoxRatio(ratio);
        } else {
            System.err.println("Illegal request from client.");
            try {
                session.close(ILLEGAL_INPUT);
                // TODO: does this trigger EventSocket.onWebSocketClose and thus call removeClient ?
            } catch (IOException e) {
                System.err.println(e.getMessage());
            }
        }
    }

    /**
     * Based on <a href="https://stackoverflow.com/a/38026079/3315770">this SO answer</a>
     * TODO #133:
     *  - check if all of this is required
     *  - keystore
     */
    private static void addSecureConnector(Server server) {
        final var sslContextFactory = new SslContextFactory.Server();
        //sslContextFactory.setKeyStorePath("...");
        //sslContextFactory.setKeyStorePassword("...");

        final var sslConnectionFactory = new SslConnectionFactory(sslContextFactory, HttpVersion.HTTP_1_1.asString());
        final var httpConfiguration = new HttpConfiguration();
        httpConfiguration.setSecureScheme("https");
        httpConfiguration.setSecurePort(8443);
        final var httpConnectionFactory = new HttpConnectionFactory(httpConfiguration);

        final ServerConnector wssConnector = new ServerConnector(server, sslConnectionFactory, httpConnectionFactory);
        wssConnector.setPort(8443);
        server.addConnector(wssConnector);
    }
}
