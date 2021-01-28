package server;

import game.Snake;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;

import java.nio.ByteBuffer;

public class SnakeServer {
    private static Snake testSnake;

    static {
        var snake = new Snake();
        snake.tick();
        snake.tick();
        snake.updateDirection(80, 2);
        snake.tick();
        snake.tick();
        snake.fast = true;
        snake.tick();
        snake.tick();
        snake.debug();
        testSnake = snake;
    }

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

        try
        {
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
            server.join();
        }
        catch (Throwable t)
        {
            t.printStackTrace(System.err);
        }
    }

    public static ByteBuffer getSnakeData() {
        return testSnake.chunks.get(0).buffer();
    }
}

