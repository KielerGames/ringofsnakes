package server.protocol;

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
    World world = new World();
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
        assertNotNull(updateData);
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
        assertNotNull(update1);

        client.updateClientFoodChunk(chunk);
        var update2 = captureUpdateData(client);
        assertNotNull(update2);

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
        assertNotNull(update1);
        assertEquals(1, update1.get(3));

        chunk.addFood();
        client.updateClientFoodChunk(chunk);
        var update2 = captureUpdateData(client);
        assertNotNull(update2);
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

        return captor.getValue();
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