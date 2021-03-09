package game.snake;

import math.BoundingBox;
import math.Vector;

import java.nio.ByteBuffer;
import java.util.*;

public class SnakeChunk implements SnakeChunkData {
    public final static int BYTE_SIZE = 128;
    public final static int HEADER_BYTE_SIZE = 21;
    public final static int BUFFER_N_POS = 4;
    public final static int BUFFER_OFFSET_POS = 17;

    private final Snake snake;
    private ByteBuffer chunkByteBuffer;
    private float length;
    private int uniqueId;
    private Map<Byte, List<Vector>> pointData;

    private BoundingBox boundingBox;


    protected SnakeChunk(Snake snake, ByteBuffer buffer, BoundingBox box, float length,
                         List<Vector> points) {
        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.snake = snake;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
        this.pointData = new HashMap<>();


        //TODO: init pointData
        // split point list from snakechunkbuilder into map of sublists
        initPointData(points);

    }

    /*

     */
    private void initPointData(List<Vector> points) {
        int numberOfHorizontalBins = 4;
        int numberOfVerticalBins = 4;
        double chunkWidth = boundingBox.maxX - boundingBox.minX;
        double chunkHeight = boundingBox.maxY - boundingBox.minY;
        double binWidth = chunkWidth / numberOfHorizontalBins;
        double binHeight = chunkHeight / numberOfVerticalBins;
        byte b;


        for (Vector point : points) {
            int horizontalBin;
            int verticalBin;
            horizontalBin = (int) ((point.x - boundingBox.minX) / chunkWidth * numberOfHorizontalBins);
            verticalBin = (int) ((point.y - boundingBox.minY) / chunkHeight * numberOfVerticalBins);
            int index = numberOfHorizontalBins * verticalBin + horizontalBin;
            byte hash = (byte) index;

            if (pointData.get(hash) == null) {
                LinkedList<Vector> l = new LinkedList<>();
                l.add(point);
                pointData.put(hash, l);
            } else {
                pointData.get(hash).add(point);
            }
        }
        //System.out.println("Debug");
    }


    public ByteBuffer getBuffer() {
        return chunkByteBuffer.asReadOnlyBuffer().flip();
    }

    public Snake getSnake() {
        return this.snake;
    }

    public int getByteSize() {
        return BYTE_SIZE;
    }

    public boolean isEmpty() {
        return false;
    }

    public boolean isFull() {
        return true;
    }

    public int getUniqueId() {
        return this.uniqueId;
    }

    public float getLength() {
        return this.length;
    }

    public boolean doesCollideWith(Vector position, double radius) {
        //TODO: implement
        // use pointData
        return false;
    }

    public void setOffset(float offset) {
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, offset);
    }

    public boolean isJunk() {
        return chunkByteBuffer.getFloat(BUFFER_OFFSET_POS) >= snake.getLength();
    }
}