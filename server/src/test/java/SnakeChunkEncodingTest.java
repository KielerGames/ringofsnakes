import game.Snake;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

public class SnakeChunkEncodingTest {

    Snake snake = new Snake(42, -42);

    @Test
    void Test(){
        Snake.SnakeChunk chunk = snake.getLastChunk();
        chunk.setChunkParameters(22, 33, 3.3, 44);
        ByteBuffer b = chunk.chunkByteBuffer;
        int numberOfChainCodes = b.get(0); //Get int with Byte Index 0
        float endDirection = b.getFloat(1); //Get float from Byte Index 1 to 4
        float endY = b.getFloat(5); //Get float from Byte Index 5 to 8
        float endX = b.getFloat(9); //Get float from Byte Index 9 to 12
        System.out.println("Number of Chaincodes: " + numberOfChainCodes);
        System.out.println("End Direction: " + endDirection);
        System.out.println("End.Y: " + endY);
        System.out.println("End.X: " + endX);
    }
}
