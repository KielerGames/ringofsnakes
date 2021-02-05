import game.Snake;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

public class SnakeChunkEncodingTest {

    Snake snake = new Snake(42, -42);

    @Test
    void Test(){
        System.out.println("Test");
        ByteBuffer b = snake.getLastChunk().chunkByteBuffer;
        System.out.println(b.toString());

        for(int i = 0; i < b.limit(); i++){
            System.out.println(b.getFloat(i));
        }




    }
}
