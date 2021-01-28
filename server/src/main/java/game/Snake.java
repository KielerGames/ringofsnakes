package game;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Snake {
    private double length = 1.0;
    private Vector headPosition = new Vector(0, 0);
    private double headDirection = 0.0;
    private double lastDirection = headDirection;
    private Vector lastCCPosition = headPosition.clone();
    private List<SnakeChunk> chunks = new LinkedList<>();
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

    public void updateDirection(double x, double y) {
        this.headDirection = Math.atan2(y, x);
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

    public void debug() {
        System.out.println("Snake data:");
        for (SnakeChunk chunk : chunks) {
            chunk.debug();
        }
    }

    class SnakeChunk {
        public final static int CHUNK_SIZE = 64;
        Vector end;
        double endDirection;
        private byte[] chainCodes;
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

        SnakeChunk() {
            chainCodes = new byte[CHUNK_SIZE];
            end = headPosition;
            endDirection = headDirection;
            halfWidth = 0.5 * 0.2; // width 0.2

            minX = maxX = end.x;
            minY = maxY = end.y;

            currentPosition = end.clone();
            currentAlpha = headDirection;
        }

        public void add(int dirDelta) {
            if (nextIndex == chainCodes.length) {
                throw new IllegalStateException();
            }

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
                chainCodes[nextIndex-1] = coder.encode(lastDirDelta, fast, lastSteps + 1);
                lastSteps++;
            } else {
                // add new chaincode
                chainCodes[nextIndex] = coder.encode(dirDelta, fast, 1);
                nextIndex++;
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
            return nextIndex == chainCodes.length;
        }

        public void debug() {
            System.out.println("Snake chunk data:");
            int i=0;
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
        }
    }
}
