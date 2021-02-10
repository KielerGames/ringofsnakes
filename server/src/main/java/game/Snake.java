package game;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Snake {
    private double length = 1.0;
    private Vector headPosition = new Vector(0, 0);
    private double headDirection = 0.0;
    private double lastDirection = headDirection;
    private Vector lastCCPosition = headPosition.clone();
    public List<SnakeChunk> chunks = new LinkedList<>();
    private SnakeChunk currentChunk;
    private double speed = 1.0;
    private ChainCodeCoder coder = new ChainCodeCoder();
    public boolean fast = false;

    public static final double deltaTime = 1.0 / 60.0;
    public static final double ccStepLength = 1.0 * deltaTime;

    public Snake() {
        currentChunk = new SnakeChunk();
        chunks.add(currentChunk);
    }

    public Snake(double startX, double startY) {
        this.headPosition = new Vector(startX, startY);
        currentChunk = new SnakeChunk();
        chunks.add(currentChunk);
    }

    public void updateDirection(double x, double y) {
        this.headDirection = Math.atan2(y, x);
    }

    public void updateDirection(double alpha) {
        while (Math.abs(alpha) > Math.PI) {
            alpha -= Math.signum(alpha) * 2.0 * Math.PI;
        }
        this.headDirection = alpha;
    }

    public void tick() {
        // move head
        headPosition.addDirection(headDirection, ccStepLength);

        // encode direction change
        int dirDelta = coder.sampleDirectionChange(headDirection, lastDirection);

        // update lastDirection and normalize to [-PI,PI]
        lastDirection += coder.decodeDirectionChange(dirDelta);
        if (Math.abs(lastDirection) > Math.PI) {
            lastDirection -= Math.signum(lastDirection) * 2.0 * Math.PI;
        }

        currentChunk.add(dirDelta);

        if(currentChunk.finalized()) {
            currentChunk = new SnakeChunk();
            chunks.add(currentChunk);
        }
    }

   /* public void debug() {
        System.out.println("Snake data:");
        for (SnakeChunk chunk : chunks) {
            chunk.debug();
        }
    }*/

    public SnakeChunk getLastChunk() {
        return chunks.get(chunks.size() - 1);
    }

    public class SnakeChunk {
        public final static int CHUNK_SIZE = 64;
        Vector end;
        double endDirection;
        public ByteBuffer chunkByteBuffer;
        double length = 0.0;
        double halfWidth;

        // bounding box
        private double minX, maxX, minY, maxY;

        // building state
        private int nextIndex = 0;
        private Vector currentPosition;
        private double currentAlpha;
        private int lastSteps = 0;
        private boolean lastFast = false;
        private int lastDirDelta = 0;
        private int numberOfChainCodes = 0;


        SnakeChunk() {

            System.out.println("Creating new chunk!");

            end = headPosition;
            endDirection = headDirection;
            halfWidth = 0.5 * 0.2; // width 0.2

            minX = maxX = end.x;
            minY = maxY = end.y;

            currentPosition = end.clone();
            currentAlpha = headDirection;


            chunkByteBuffer = createChunkBuffer(this.end.x, this.end.y, this.endDirection, CHUNK_SIZE);


        }


        /**
         * Encoding:  ChainCodes   endPositionX, endPositionY, endDirection, numberOfChainodes
         * Bytes:       [63:13]      [12:9]        [8:5]         [4:1]               [0]
         *
         * @return Chunk encoded in 64 Bytes of which the first 13 Bytes are the Header
         */
        public ByteBuffer createChunkBuffer(double endX, double endY, double endDir, int numChainCodes) {

            ByteBuffer buffer = ByteBuffer.allocate(CHUNK_SIZE); //Create buffer with capacity of CHUNK_SIZE Byte
            buffer.put((byte) numChainCodes);           //Write to Byte as Position 0
            buffer.putFloat((float) endDir);             //Write 4 Bytes from 1 to 4
            buffer.putFloat((float) endY);               //Write 4 Bytes from 5 to 8
            buffer.putFloat((float) endX);               //Write 4 Bytes from 9 to 12
            return buffer;

        }

        public void add(int dirDelta) {
/*
            if (nextIndex == chainCodes.length) {
                throw new IllegalStateException();
            }


 */



            // update direction
            currentAlpha += coder.decodeDirectionChange(dirDelta);
            if (Math.abs(currentAlpha) > Math.PI) {
                currentAlpha -= Math.signum(currentAlpha) * 2.0 * Math.PI;
            }

            // update chaincodes
            currentPosition.addDirection(currentAlpha, ccStepLength);
            length += ccStepLength;
            if (nextIndex > 0 && dirDelta == 0 && lastSteps < coder.MAX_STEPS && lastFast == fast) {
                // increase steps of last chaincode
                chunkByteBuffer.put(nextIndex-1, coder.encode(lastDirDelta, fast, lastSteps + 1));
                lastSteps++;
            } else {
                // add new chaincode
                this.chunkByteBuffer.put(coder.encode(dirDelta, fast, 1));
                this.numberOfChainCodes++;
                lastDirDelta = dirDelta;
            }
            lastFast = fast;

            // update bounding box
            minX = Math.min(minX, currentPosition.x - halfWidth);
            minY = Math.min(minY, currentPosition.y - halfWidth);
            maxX = Math.max(maxX, currentPosition.x + halfWidth);
            maxY = Math.max(maxY, currentPosition.y + halfWidth);
        }

        public boolean finalized() {
            return this.chunkByteBuffer.position() == CHUNK_SIZE;
        }



        /**
         * This Method has currently no purpose besides being useful in the testing of the encoding of the Snake Chunks.
         *
         * @param endX
         * @param endY
         * @param endDir
         * @param numChainCodes
         */
        public void setChunkParameters(double endX, double endY, double endDir, int numChainCodes) {
            this.end.x = endX;
            this.end.y = endY;
            this.endDirection = endDir;
            this.chunkByteBuffer = createChunkBuffer(endX, endY, endDir, numChainCodes);
        }

    }

    public void debug() {

        for (SnakeChunk chunk : chunks) {
            System.out.println("Snake chunk data:");

            ByteBuffer b = chunk.chunkByteBuffer;
            int numberOfChainCodes = b.get(0); //Get int with Byte Index 0
            float endDirection = b.getFloat(1); //Get float from Byte Index 1 to 4
            float endY = b.getFloat(5); //Get float from Byte Index 5 to 8
            float endX = b.getFloat(9); //Get float from Byte Index 9 to 12
            System.out.println("Snake head direction: " + this.headDirection);
            System.out.println("Number of chaincode in chunk: " + chunk.numberOfChainCodes);
            System.out.println("---Begin of chunk header---");
            System.out.println("End direction: " + endDirection);
            System.out.println("End.Y: " + endY);
            System.out.println("End.X: " + endX);
            System.out.println("---End of chunk header---\n");

            DecodedDirectionData d;
            System.out.println("---Begin of chaincode list---\n");
            for (int i = 13; i < 13 + chunk.numberOfChainCodes; i++) {
                System.out.println("Chaincode at Byte " + i);
                d = coder.decode(b.get(i));
                System.out.println(d.toString());

            }
            System.out.println("---End of chaincode---\n");


        }


            /*
            for (byte code : chainCodes) {
                var data = coder.decode(code);
                var dir = coder.decode(code).direction;
                var angle = Math.round(coder.decodeDirectionChange(dir) * 180 / Math.PI);
                System.out.println(" dirDelta: " + angle + "°, steps: " + data.steps + ", code: " + code);
                i++;

                if(i == nextIndex && i < chainCodes.length) {
                    System.out.println(" -- not finalized");
                    break;
                }
            }
            */
    }
}
