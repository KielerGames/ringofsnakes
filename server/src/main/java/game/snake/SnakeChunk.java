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
    private Map<Integer, List<Vector>> pointData;

    private BoundingBox boundingBox;
    private LinkedList<Vector> points = new LinkedList<Vector>();
    private double minX;
    private double maxX;
    private double minY;
    private double maxY;

    protected SnakeChunk(Snake snake, ByteBuffer buffer, BoundingBox box, float length,
                         LinkedList<Vector> points, double minX, double maxX, double minY, double maxY)
    {
        assert buffer.position() == BYTE_SIZE;
        assert length > 0;

        this.snake = snake;
        chunkByteBuffer = buffer;
        boundingBox = box;
        this.length = length;
        this.uniqueId = buffer.getInt(0); // bytes 0-3
        this.points = (LinkedList<Vector>) points.clone();
        this.pointData = new HashMap<Integer, List<Vector>>();
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        //TODO: init pointData
        // split point list from snakechunkbuilder into map of sublists
        initPointData();

    }

    /*

     */
    private void initPointData() {
        int numberOfHorizontalBins = 16;
        int numberOfVerticalBins = 16;
        double chunkWidth = maxX - minX;
        double chunkHeight = maxY - minY;
        double binWidth = chunkWidth/(double)numberOfHorizontalBins;
        double binHeight = chunkHeight/(double)numberOfVerticalBins;
        byte b;

        Iterator<Vector> iterator = points.iterator();

        while(iterator.hasNext()){
            Vector point = iterator.next();
            int horizontalBin;
            int verticalBin;
            horizontalBin = (int)((point.x - minX)/chunkWidth*numberOfHorizontalBins);
            verticalBin = (int)((point.y - minY)/chunkHeight*numberOfVerticalBins);
            int index = 16*verticalBin + horizontalBin;
            byte hash = (byte) index;

            if(pointData.get((int) hash) == null) {
                LinkedList<Vector> l = new LinkedList<Vector>();
                l.add(point);
                pointData.put((int) hash, l);
            }
            else
            {
                pointData.get((int) hash).add(point);
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

    public boolean isFull() { return true; }

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