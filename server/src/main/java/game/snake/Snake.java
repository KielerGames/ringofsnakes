package game.snake;

import game.GameConfig;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

public class Snake {
    public static final int INFO_BYTE_SIZE = 20;
    public static final float START_LENGTH = 42f;
    private static Random random = new Random();
    private static short nextSnakeId = 0;
    public final GameConfig config = new GameConfig();
    public final short id;
    public final byte skin;
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    final Vector headPosition;
    public List<SnakeChunk> chunks = new LinkedList<>();
    float headDirection;
    private short nextChunkId = 0;
    private double targetDirection;
    private boolean fast = false;
    private float length = START_LENGTH;
    public SnakeChunkBuilder chunkBuilder;
    private ByteBuffer snakeInfoBuffer;

    public Snake() {
        this(0.0, 0.0);
    }

    public Snake(double startX, double startY) {
        id = nextSnakeId++;
        skin = (byte) (random.nextInt(100) % 2);

        snakeInfoBuffer = ByteBuffer.allocate(INFO_BYTE_SIZE);
        snakeInfoBuffer.putShort(0, id);
        snakeInfoBuffer.put(2, skin);

        // start position & rotation
        headPosition = new Vector(startX, startY);
        headDirection = (float) ((random.nextDouble() * 2.0 - 1.0) * Math.PI);
        targetDirection = headDirection;

        // create first chunk
        beginChunk();
    }

    public void setTargetDirection(double alpha) {
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
        chunkBuilder.append(encDirDelta, fast);
        // after an update a chunk might be full
        if (chunkBuilder.isFull()) {
            System.out.println("chunk " + chunkBuilder.getUniqueId() + " is full (length: " + chunkBuilder.getLength() + ")");
            beginChunk();
        }
        float offset = chunkBuilder.getLength();
        for(SnakeChunk chunk : chunks) {
            chunk.setOffset(offset);
            offset += chunk.getLength();
        }
        if(chunks.size() > 0) {
            SnakeChunk lastChunk = chunks.get(chunks.size()-1);
            if(lastChunk.isJunk()) {
                chunks.remove(chunks.size()-1);
            }
        }
    }

    private void beginChunk() {
        if (chunkBuilder != null) {
            assert chunkBuilder.isFull();

            chunks.add(chunkBuilder.build());
        }

        chunkBuilder = new SnakeChunkBuilder(coder, this, nextChunkId++);
    }

    public ByteBuffer getLatestMeaningfulBuffer() {
        if(chunkBuilder.isEmpty() && chunks.size() > 0) {
            return chunks.get(chunks.size()-1).getBuffer();
        }
        return chunkBuilder.getBuffer();
    }

    public float getWidth() {
        return 0.2f;
    }

    public float getLength() {
        return this.length;
    }

    public ByteBuffer getInfo() {
        var buffer = this.snakeInfoBuffer;
        buffer.put(3, (byte) (fast ? 1 : 0));
        buffer.putFloat(4, length);
        buffer.putFloat(8, headDirection);
        buffer.putFloat(12, (float) headPosition.x);
        buffer.putFloat(16, (float) headPosition.y);
        buffer.position(INFO_BYTE_SIZE);

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
