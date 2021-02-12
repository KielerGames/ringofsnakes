package game;

import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;

public class Snake {
    public static final double ccStepLength = 0.2;
    private final Vector headPosition;
    private final ChainCodeCoder coder = new ChainCodeCoder();
    public List<SnakeChunk> chunks = new LinkedList<>();
    public boolean fast = false;
    private double length = 1.0;
    private double headDirection;
    private double targetDirection;
    private SnakeChunk currentChunk;

    public Snake() {
        this(0.0, 0.0);
    }

    public Snake(double startX, double startY) {
        this.headPosition = new Vector(startX, startY);
        this.headDirection = (Math.random() * 2.0 - 1.0) * Math.PI;
        this.targetDirection = this.headDirection;
        currentChunk = new SnakeChunk();
        chunks.add(currentChunk);
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
        if (Math.abs(headDirection) > Math.PI) {
            headDirection -= Math.signum(headDirection) * 2.0 * Math.PI;
        }

        // move head
        headPosition.addDirection(headDirection, ccStepLength);

        // update chunk
        currentChunk.add(encDirDelta);

        if (currentChunk.finalized()) {
            currentChunk = new SnakeChunk();
            chunks.add(currentChunk);
        }
    }

    public SnakeChunk getLastChunk() {
        return chunks.get(chunks.size() - 1);
    }

    public void debug() {

        for (SnakeChunk chunk : chunks) {
            System.out.println("Snake chunk data:");

            ByteBuffer b = chunk.chunkByteBuffer;
            int numberOfChainCodes = b.get(0); //Get int with Byte Index 0
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

            DecodedDirectionData d;
            System.out.println("---Begin of chaincode list---\n");
            for (int i = 25; i < 25 + chunk.numberOfChainCodes; i++) {
                System.out.println("Chaincode at Byte " + i);
                d = coder.decode(b.get(i));
                System.out.println(d.toString());

            }
            System.out.println("---End of chaincode---\n");
        }
    }

    public class SnakeChunk {
        public final static int CHUNK_SIZE = 128;

        // building state
        public ByteBuffer chunkByteBuffer;
        Vector end;
        double endDirection;
        double length = 0.0;
        double halfWidth;

        // bounding box
        private double minX, maxX, minY, maxY;
        private int lastSteps = 0;
        private boolean lastFast = false;
        private int lastDirDelta = 0;
        private byte numberOfChainCodes = 0;


        SnakeChunk() {
            end = headPosition.clone();
            endDirection = headDirection;
            halfWidth = 0.5 * 0.2; // width 0.2

            minX = maxX = end.x;
            minY = maxY = end.y;

            chunkByteBuffer = createChunkBuffer();
        }


        /**
         * Encoding:  ChainCodes   endPositionX, endPositionY, endDirection, numberOfChainodes
         * Bytes:       [127:25]      [24:17]        [16:9]         [8:1]               [0]
         *
         * @return Chunk encoded in 64 Bytes of which the first 25 Bytes are the Header
         */
        public ByteBuffer createChunkBuffer() {
            ByteBuffer buffer = ByteBuffer.allocate(CHUNK_SIZE); //Create buffer with capacity of CHUNK_SIZE Byte
            buffer.put(this.numberOfChainCodes);                 //Write to Byte as Position 0
            buffer.putDouble(this.endDirection);                 //Write 8 Bytes from 1 to 8
            buffer.putDouble( this.end.y);                       //Write 8 Bytes from 9 to 16
            buffer.putDouble( this.end.x);                       //Write 8 Bytes from 17 to 24
            assert (buffer.position() == 25);
            return buffer;
        }

        public void add(int dirDelta) {
            if (this.chunkByteBuffer.position() >= CHUNK_SIZE) {
                throw new IllegalStateException("Buffer is full!");
            }

            // update chaincodes
            length += ccStepLength; //TODO: include fast
            final int nextIndex = this.chunkByteBuffer.position();
            if (nextIndex > 0 && dirDelta == 0 && lastSteps < ChainCodeCoder.MAX_STEPS && lastFast == fast) {
                // increase steps of last chaincode
                chunkByteBuffer.put(nextIndex - 1, coder.encode(lastDirDelta, fast, lastSteps + 1));
                lastSteps++;
            } else {
                // add new chaincode
                this.chunkByteBuffer.put(coder.encode(dirDelta, fast, 1));
                this.numberOfChainCodes++;
                this.chunkByteBuffer.put(0, this.numberOfChainCodes);
                lastSteps = 1;
                lastDirDelta = dirDelta;
            }
            lastFast = fast;

            // update bounding box
            minX = Math.min(minX, headPosition.x - halfWidth);
            minY = Math.min(minY, headPosition.y - halfWidth);
            maxX = Math.max(maxX, headPosition.x + halfWidth);
            maxY = Math.max(maxY, headPosition.y + halfWidth);
        }

        public boolean finalized() {
            return this.chunkByteBuffer.position() == CHUNK_SIZE;
        }


        /**
         * This Method has currently no purpose besides being useful in the testing of the encoding of the Snake Chunks.
         */
        public void setChunkParameters(double endX, double endY, double endDir, int numChainCodes) {
            this.end.x = endX;
            this.end.y = endY;
            this.endDirection = endDir;
            this.chunkByteBuffer = createChunkBuffer();
        }

    }
}
