import game.snake.Snake;
import org.junit.jupiter.api.Test;

public class SnakeChunkEncodingTest {

    Snake snake = new Snake(42, -42);

    @Test
    void Test(){
        /*Snake.SnakeChunk chunk = snake.getLastChunk();
        chunk.setChunkParameters(22, 33, 3.3, 44);
        ByteBuffer b = chunk.chunkByteBuffer;
        int numberOfChainCodes = b.get(0); //Get int with Byte Index 0
        double endDirection = b.getFloat(1); //Get double from Byte Index 1 to 8
        double endY = b.getFloat(9); //Get double from Byte Index 9 to 16
        double endX = b.getFloat(9); //Get double from ybte index 17 to 24
        System.out.println("Number of Chaincodes: " + numberOfChainCodes);
        System.out.println("End Direction: " + endDirection);
        System.out.println("End.Y: " + endY);
        System.out.println("End.X: " + endX);*/
        // TODO
    }
}
