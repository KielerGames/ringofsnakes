package server;

import game.Game;
import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;
import server.clients.Client;
import server.clients.Player;

import javax.websocket.Session;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class SnakeServer {
    private final static Map<String, Client> clients = Collections.synchronizedMap(new HashMap<>(64));
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
        Player player;
        try {
            player = game.createPlayer(session).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return;
        }

        clients.put(session.getId(), player);
    }

    public static void removeClient(Session session) {
        final var sessionId = session.getId();
        clients.remove(sessionId);
        game.removeClient(session);
        System.out.println("Client has been removed. (" + sessionId + ")");
    }

    public static void updateClient(Client newClient) {
        final var sessionId = newClient.session.getId();
        final var oldClient = clients.put(sessionId, newClient);
        assert oldClient != null;
    }

    public static void handleClientMessage(Session session, float alpha, boolean fast, float ratio) {
        final var client = clients.get(session.getId());
        client.setViewBoxRatio(ratio);
        client.handleUserInput(alpha, fast);
    }

    private static void addSecureConnector(Server server) {
        final var env = System.getenv();

        if (!env.containsKey("SNAKE_KEYSTORE_PATH") || !env.containsKey("SNAKE_KEYSTORE_PW")) {
            System.err.println("Cannot create a secure connector without keystore configuration.");
            return;
        }

        if (!Files.exists(Paths.get(env.get("SNAKE_KEYSTORE_PATH")))) {
            System.err.println("Keystore file not found, skipping secure connector.");
            return;
        }

        final var sslContextFactory = new SslContextFactory.Server();
        sslContextFactory.setKeyStorePath(env.get("SNAKE_KEYSTORE_PATH"));
        sslContextFactory.setKeyStorePassword(env.get("SNAKE_KEYSTORE_PW"));

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
