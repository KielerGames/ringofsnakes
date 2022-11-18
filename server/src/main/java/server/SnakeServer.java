package server;

import game.Game;
import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(SnakeServer.class);
    private static final Map<String, Client> CLIENTS = Collections.synchronizedMap(new HashMap<>(64));
    private static Game game;

    public static Server start(Game game) {
        SnakeServer.game = game;

        Server server = new Server();

        ServerConnector wsConnector = new ServerConnector(server);
        wsConnector.setPort(8080);
        server.addConnector(wsConnector);

        addSecureConnector(server);

        // Set up the basic application "context" for this application at "/"
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

        WebSocketServerContainerInitializer.configure(context, (servletContext, wsContainer) -> {
            // TODO #155: Find optimal websocket config
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

    public static void start() throws InterruptedException {
        game = new Game();
        final var server = start(game);
        game.start();
        server.join();
    }

    public static void onNewClientConnected(Session session) {
        LOGGER.info("A new client has connected.");
        Player player;
        try {
            player = game.createPlayer(session).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return;
        }

        CLIENTS.put(session.getId(), player);
    }

    public static void removeClient(Session session) {
        final var sessionId = session.getId();
        CLIENTS.remove(sessionId);
        game.removeClient(session);
        LOGGER.info("Client has been removed. (" + sessionId + ")");
    }

    public static void updateClient(Client newClient) {
        final var sessionId = newClient.session.getId();
        final var oldClient = CLIENTS.put(sessionId, newClient);
        assert oldClient != null;
    }

    public static void handleClientMessage(Session session, float alpha, boolean fast, float ratio) {
        final var client = CLIENTS.get(session.getId());
        client.setViewBoxRatio(ratio);
        client.handleUserInput(alpha, fast);
    }

    private static void addSecureConnector(Server server) {
        final var env = System.getenv();

        if (!env.containsKey("SNAKE_KEYSTORE_PATH") || !env.containsKey("SNAKE_KEYSTORE_PW")) {
            LOGGER.warn("Cannot create a secure connector without keystore configuration.");
            LOGGER.warn("Set SNAKE_KEYSTORE_PATH and SNAKE_KEYSTORE_PW environment variables.");
            return;
        }

        if (!Files.exists(Paths.get(env.get("SNAKE_KEYSTORE_PATH")))) {
            LOGGER.warn("Keystore file not found, skipping secure connector.");
            LOGGER.warn("Keystore path: {}", Paths.get(env.get("SNAKE_KEYSTORE_PATH")));
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
        LOGGER.debug("Secure Websockets enabled.");
    }
}
