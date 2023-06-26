package server.recording;

import com.sun.javafx.PlatformUtil;
import game.snake.Snake;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import server.clients.ClientKnowledge;
import server.protocol.GameInfo;
import server.protocol.GameUpdate;
import server.protocol.SnakeNameUpdate;
import util.FileUtilities;
import util.JSON;

import javax.websocket.Session;
import java.io.IOException;
import java.io.Serializable;
import java.nio.ByteBuffer;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

public class ClientDataRecording implements Serializable, Iterable<ClientDataRecording.WebsocketMessage> {
    private final List<WebsocketMessage> messages = new LinkedList<>();

    private ClientDataRecording() {
    }

    public static ClientDataRecording createAfterGameStart(Snake snake, ClientKnowledge knowledge) {
        final var recording = new ClientDataRecording();
        recording.addTextMessage(JSON.stringify(new GameInfo(snake)));

        // Send known snake names.
        final var snakeNames = new SnakeNameUpdate();
        knowledge.streamKnownSnakes().forEach(snakeNames::addNameOf);
        recording.addTextMessage(JSON.stringify(snakeNames));

        // Send known snake chunks.
        final var gameUpdate = new GameUpdate();
        knowledge.streamKnownSnakeChunks().forEach(gameUpdate::addSnakeChunk);
        recording.addBinaryMessage(gameUpdate.createUpdateBuffer());

        return recording;
    }

    public void addTextMessage(String textData) {
        messages.add(new WebsocketTextMessage(textData));
    }

    public void addBinaryMessage(ByteBuffer binaryData) {
        messages.add(new WebsocketBinaryMessage(binaryData.isReadOnly() ? binaryData : binaryData.asReadOnlyBuffer()));
    }

    public void saveAsFile() {
        // TODO
        final var file = FileUtilities.selectFileToSaveTo("Save recording");
    }

    public Iterator<WebsocketMessage> iterator() {
        return messages.iterator();
    }

    public abstract static class WebsocketMessage implements Serializable {
        public abstract void resend(Session session);
    }

    private static class WebsocketTextMessage extends WebsocketMessage {
        final String data;

        WebsocketTextMessage(String textData) {
            this.data = textData;
        }

        @Override
        public void resend(Session session) {
            try {
                session.getBasicRemote().sendText(data);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static class WebsocketBinaryMessage extends WebsocketMessage {
        final ByteBuffer data;

        WebsocketBinaryMessage(ByteBuffer binaryData) {
            this.data = binaryData;
        }

        @Override
        public void resend(Session session) {
            try {
                session.getBasicRemote().sendBinary(data);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
