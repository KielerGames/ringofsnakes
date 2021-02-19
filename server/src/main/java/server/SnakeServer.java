package server;

import com.google.gson.Gson;
import game.Game;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;
import server.protocol.SpawnInfo;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.Map;

public class SnakeServer {
    private static Map<String, Player> players = new HashMap<>();
    private static Gson gson = new Gson();
    private static Game game = new Game();

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

    public static void createPlayer(Session session) {
        var snake = game.addSnake();
        var player = new Player(snake, session);
        players.put(session.getId(), player);
        String data = gson.toJson(new SpawnInfo(game.config, snake));
        player.sendSync(data);
    }

    public static void removePlayer(Session session) {
        players.remove(session.getId());
    }

    public static void setDirection(Session session, double alpha) {
        var player = players.get(session.getId());
        assert player != null;
        player.session = session;
        player.snake.setTargetDirection(alpha);
    }

    private static class Ticker implements Runnable {
        public void run() {
            while (true) {
                game.tick();

                players.forEach((id, player) -> {
                    //TODO: filter visible chunks
                    game.snakes.forEach(snake ->
                            snake.chunks.forEach(player::updateChunk)
                    );
                    player.sendUpdate();
                });

                // TODO: measure time and adapt
                sleep(1000 / 30);
            }
        }

        private void sleep(int time) {
            try {
                Thread.sleep(time);
            } catch (InterruptedException ignored) {
            }
        }
    }
}
