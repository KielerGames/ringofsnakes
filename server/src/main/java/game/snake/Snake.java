package game.snake;

import game.GameConfig;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class Snake {
    public final GameConfig config = new GameConfig();
    final ChainCodeCoder coder = new ChainCodeCoder(config);
    private static short nextSnakeId = 0;

    public final short id;
    final Vector headPosition;
    double headDirection;
    private double targetDirection;
    private SnakeChunkBuilder chunkBuilder;
    public List<SnakeChunk> chunks = new LinkedList<>();

    private boolean fast = false;
    private double length = 1.0;


    private short nextChunkId = 0;

    public Snake() {
        this(0.0, 0.0);
    }

    public Snake(double startX, double startY) {
        id = nextSnakeId++;

        // start position & rotation
        headPosition = new Vector(startX, startY);
        headDirection = (Math.random() * 2.0 - 1.0) * Math.PI;
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

        // update chunk
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
