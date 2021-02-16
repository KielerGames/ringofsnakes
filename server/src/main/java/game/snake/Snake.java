package game.snake;

import game.GameConfig;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

public class Snake {
    public final GameConfig config = new GameConfig();
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    private static Random random = new Random();
    private static short nextSnakeId = 0;
    private short nextChunkId = 0;
    private static final int SNAKE_INFO_BYTE_SIZE = 20;

    public final short id;
    public final byte skin;
    final Vector headPosition;
    float headDirection;
    private double targetDirection;
    private boolean fast = false;
    private float length = 1.0f;

    private SnakeChunkBuilder chunkBuilder;
    public List<SnakeChunk> chunks = new LinkedList<>();
    private ByteBuffer snakeInfoBuffer;

    public Snake() {
        this(0.0, 0.0);
    }

    public Snake(double startX, double startY) {
        id = nextSnakeId++;
        skin = (byte) (random.nextInt(100) % 2);

        snakeInfoBuffer = ByteBuffer.allocate(SNAKE_INFO_BYTE_SIZE);
        snakeInfoBuffer.putShort(0, id);
        snakeInfoBuffer.put(2, skin);

        // start position & rotation
        headPosition = new Vector(startX, startY);
        headDirection = (float) ((random.nextDouble() * 2.0 - 1.0) * Math.PI);
        targetDirection = headDirection;

        // create first chunk
        beginChunk();
    }

    public void updateDirection(double alpha) {
        if (Math.abs(alpha) > Math.PI) {
            System.err.println("Alpha out of range: " + alpha);
        } else {
            this.targetDirection = alpha;
        }
    }

    public void tick() {
        // update direction
        int encDirDelta = coder.sampleDirectionChange(targetDirection, headDirection);
        double dirDelta = coder.decodeDirectionChange(encDirDelta);
        headDirection += dirDelta;
        // normalize direction
        if (Math.abs(headDirection) > Math.PI) {
            headDirection -= Math.signum(headDirection) * 2.0 * Math.PI;
        }

        // move head
        headPosition.addDirection(headDirection, config.snakeSpeed);

        // update chunks
        chunkBuilder.append(headPosition, encDirDelta, fast);
        // after an update a chunk might be full
        if (chunkBuilder.isFull()) {
            beginChunk();
        }
    }

    private void beginChunk() {
        if(chunkBuilder != null) {
            assert chunkBuilder.isFull();

            chunks.add(chunkBuilder.build());
        }

        chunkBuilder = new SnakeChunkBuilder(this, nextChunkId++);
    }

    public ByteBuffer getLatestBuffer() {
        return chunkBuilder.getBuffer();
    }

    public double getWidth() {
        return 0.2;
    }

    public ByteBuffer getInfo() {
        var buffer = this.snakeInfoBuffer;
        buffer.put(3, (byte) (fast ? 1 : 0));
        buffer.putFloat(4, length);
        buffer.putFloat(8, headDirection);
        buffer.putFloat(12, (float) headPosition.x);
        buffer.putFloat(16, (float) headPosition.y);

        return buffer.asReadOnlyBuffer().flip();
    }

    /*public void debug() {

        for (SnakeChunk chunk : chunks) {
            System.out.println("Snake chunk data:");

            ByteBuffer b = chunk.chunkByteBuffer;
            double endDirection = b.getDouble(1); //Get float from Byte Index 1 to 4
            double endY = b.getDouble(9); //Get float from Byte Index 5 to 8
            double endX = b.getDouble(17); //Get float from Byte Index 9 to 12
            System.out.println("Snake head direction: " + this.headDirection);
            System.out.println("Number of chaincode in chunk: " + chunk.numberOfChainCodes);
            System.out.println("---Begin of chunk header---");
            System.out.println("End direction: " + endDirection);
            System.out.println("End.Y: " + endY);
            System.out.println("End.X: " + endX);
            System.out.println("---End of chunk header---\n");

            System.out.println("---Begin of chaincode list---\n");
            for (int i = 25; i < 25 + chunk.numberOfChainCodes; i++) {
                System.out.println("Chaincode at Byte " + i);
                var d = coder.decode(b.get(i));
                System.out.println(d.toString());

            }
            System.out.println("---End of chaincode---\n");
        }
    }*/
}
