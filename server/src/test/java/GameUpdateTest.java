import game.world.WorldChunk;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import server.Client;
import server.protocol.GameUpdate;

import javax.websocket.RemoteEndpoint;
import javax.websocket.Session;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.extension.ExtendWith;

import java.nio.ByteBuffer;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class GameUpdateTest {
    @Test
    void testEmptyUpdate() {
        var update = new GameUpdate();
        assertTrue(update.isEmpty());
    }

    @Test
    void testUpdateNotEmpty() {
        var chunk = new WorldChunk(0, 0, 42, 42, 0, 0);
        var update = new GameUpdate();
        update.addFoodChunk(chunk);
        assertFalse(update.isEmpty());
    }

    @Mock
    Session session;

    private ByteBuffer captureUpdateData(Client client) {
        var remoteEndpoint = Mockito.mock(RemoteEndpoint.Async.class);

        assertNotNull(session);
        assertNotNull(remoteEndpoint);

        when(session.isOpen()).thenReturn(true);
        when(session.getAsyncRemote()).thenReturn(remoteEndpoint);

        client.sendUpdate();

        var captor = ArgumentCaptor.forClass(ByteBuffer.class);
        verify(remoteEndpoint).sendBinary(captor.capture());

        return captor.getValue();
    }

    @Test
    void testBinaryEmptyUpdate() {
        var client = new Client(session);
        var updateData = captureUpdateData(client);
        assertNotNull(updateData);
        assertEquals(GameUpdate.HEADER_SIZE, updateData.capacity());
        assertEquals(0, updateData.get(0));
        assertEquals(0, updateData.get(1));
        assertEquals(0, updateData.get(2));
    }

    @Test
    void testBinarySameChunkOnce() {
        var client = new Client(session);
        var chunk = new WorldChunk(0, 0, 42, 42, 0, 0);
        client.updateClientFoodChunk(chunk);

        var update1 = captureUpdateData(client);
        var update2 = captureUpdateData(client);

        assertNotNull(update1);
        assertNotNull(update2);
        assertNotEquals(update1, update2);
        assertTrue(update1.capacity() > update2.capacity());
    }
}
