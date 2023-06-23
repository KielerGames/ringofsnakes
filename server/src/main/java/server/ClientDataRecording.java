package server;

import game.snake.Snake;
import server.clients.ClientKnowledge;
import server.protocol.GameInfo;
import server.protocol.GameUpdate;
import server.protocol.SnakeNameUpdate;
import util.JSON;

import java.io.Serializable;
import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class ClientDataRecording implements Serializable {
    private final List<WebsocketMessage> messages = new LinkedList<>();

    public static ClientDataRecording startRecordingAfterGameStart(Snake snake, ClientKnowledge knowledge) {
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

    private static class WebsocketMessage implements Serializable {
    }

    private static class WebsocketTextMessage extends WebsocketMessage {
        final String data;

        WebsocketTextMessage(String textData) {
            this.data = textData;
        }
    }

    private static class WebsocketBinaryMessage extends WebsocketMessage {
        final ByteBuffer data;

        WebsocketBinaryMessage(ByteBuffer binaryData) {
            this.data = binaryData;
        }
    }
}
