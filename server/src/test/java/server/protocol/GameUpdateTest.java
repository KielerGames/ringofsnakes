package server.protocol;

import game.snake.Snake;
import game.snake.SnakeChunk;
import game.snake.SnakeFactory;
import game.world.World;
import game.world.WorldChunk;
import math.BoundingBox;
import math.Vector;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import server.Client;

import javax.websocket.RemoteEndpoint;
import javax.websocket.Session;
import java.nio.ByteBuffer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GameUpdateTest {
    final World world = new World();
    @Mock
    Session session;

    @Test
    void testEmptyUpdate() {
        var update = new GameUpdate();
        assertTrue(update.isEmpty());
    }

    @Test
    void testUpdateNotEmpty() {
        var chunk = new WorldChunk(world, 0, 0, 42, 42, 0, 0);
        var update = new GameUpdate();
        update.addFoodChunk(chunk);
        assertFalse(update.isEmpty());
    }

    @Test
    void testBinaryEmptyUpdate() {
        var client = new TestClient(session);
        var updateData = captureUpdateData(client);
        assertEquals(GameUpdate.HEADER_SIZE, updateData.capacity());
        assertEquals(0, updateData.get(1));
        assertEquals(0, updateData.get(2));
        assertEquals(0, updateData.get(3));
    }

    @Test
    void testBinarySameChunkOnce() {
        var client = new TestClient(session);
        client.knowledgeBox = world.box;
        var chunk = new WorldChunk(world, 0, 0, 42, 42, 0, 0);

        client.updateClientFoodChunk(chunk);
        var update1 = captureUpdateData(client);
        verifyUpdateIsNotEmpty(update1);

        client.updateClientFoodChunk(chunk);
        var update2 = captureUpdateData(client);

        assertNotEquals(update1, update2);
        assertTrue(update1.capacity() > update2.capacity());
    }

    @Test
    void testBinarySameChunkUpdated() {
        var client = new TestClient(session);
        var chunk = new WorldChunk(world, 0, 0, 42, 42, 0, 0);
        chunk.addFood();

        client.updateClientFoodChunk(chunk);
        var update1 = captureUpdateData(client);
        assertEquals(1, update1.get(3));

        chunk.addFood();
        client.updateClientFoodChunk(chunk);
        var update2 = captureUpdateData(client);
        assertEquals(1, update2.get(3));
    }

    @Test
    void testKnowledgeDecay() {
        var client = new TestClient(session);
        var snake = SnakeFactory.createSnake(new Vector(0, 0), world);

        for (int i = 0; i < 10; i++) {
            snake.tick();
        }

        client.updateClientSnakeChunk(snake.getSnakeChunks().get(0));
        sendUpdate(client);
        var update1 = client.lastSentUpdate;
        assertTrue(update1.hasSnake(snake));

        for (int i = 0; i < 42; i++) {
            sendUpdate(client);
            if (!client.lastSentUpdate.hasSnake(snake)) {
                break;
            }
        }

        assertFalse(client.lastSentUpdate.hasSnake(snake), "Knowledge about that snake should have decayed.");
    }

    private ByteBuffer captureUpdateData(Client client) {
        var remoteEndpoint = Mockito.mock(RemoteEndpoint.Async.class);

        assertNotNull(session);
        assertNotNull(remoteEndpoint);

        when(session.isOpen()).thenReturn(true);
        when(session.getAsyncRemote()).thenReturn(remoteEndpoint);

        client.sendGameUpdate((byte) 0);

        var captor = ArgumentCaptor.forClass(ByteBuffer.class);
        verify(remoteEndpoint).sendBinary(captor.capture());

        var updateData = captor.getValue();
        verifyUpdate(updateData);

        return updateData;
    }

    private void verifyUpdate(ByteBuffer update) {
        assertNotNull(update);

        final var size = update.capacity();
        assertTrue(size >= GameUpdate.HEADER_SIZE);

        final int numSnakeInfos = update.get(1);
        final int numSnakeChunks = update.get(2);
        final int numFoodChunks = update.get(3);
        final var hasHeatMap = update.get(4) != 0;

        if (numSnakeChunks > 0) {
            assertTrue(numSnakeInfos > 0);
        }

        int minDataSize = GameUpdate.HEADER_SIZE
                + numSnakeInfos * Snake.INFO_BYTE_SIZE
                + numSnakeChunks * SnakeChunk.HEADER_BYTE_SIZE
                + numFoodChunks * WorldChunk.FOOD_HEADER_SIZE
                + (hasHeatMap ? 1 : 0);

        assertTrue(minDataSize <= size);
    }

    private void verifyUpdateIsNotEmpty(ByteBuffer update) {
        final int numSnakeInfos = update.get(1);
        final int numSnakeChunks = update.get(2);
        final int numFoodChunks = update.get(3);
        final var hasHeatMap = update.get(4) != 0;

        assertTrue(numSnakeInfos > 0 || numSnakeChunks > 0 || numFoodChunks > 0 || hasHeatMap);
    }

    private void sendUpdate(Client client) {
        captureUpdateData(client);
    }

    private static class TestClient extends Client {
        public BoundingBox knowledgeBox = new BoundingBox(0, 0, 100, 100);
        public GameUpdate lastSentUpdate;

        TestClient(Session session) {
            super(session);
        }

        @Override
        public BoundingBox getKnowledgeBox() {
            return knowledgeBox;
        }

        @Override
        protected void onBeforeUpdateBufferIsCreated(GameUpdate update) {
            lastSentUpdate = update;
        }
    }
}