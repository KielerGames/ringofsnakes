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
    private final static int gridSideLength = 4;

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

        //some primitive testing of the collision detection, needs to be deleted later
        assert(doesCollideWith(snake.headPosition, 10) ==  doesCollideWith(snake.headPosition, points, 10));
        if(doesCollideWith(snake.headPosition, points, 10)){System.out.println("Collision");}

    }

    private void initPointData(List<Vector> points) {
        byte b;
        for (Vector point : points) {

            byte hash = getHashFromRowAndColumn(getGridRow(point), getGridColumn(point));

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

    private int getGridColumn(Vector point){
        double chunkWidth = boundingBox.maxX - boundingBox.minX;
        double relativePosition =  (point.x - boundingBox.minX)/chunkWidth;
        int column =  (relativePosition != 1 ? (int)(relativePosition * gridSideLength) : (int)(relativePosition * gridSideLength));
        return column;
    }

    private int getGridRow(Vector point){
        double chunkWidth = boundingBox.maxY - boundingBox.minY;
        double relativePosition =  (point.y - boundingBox.minY)/chunkWidth;
        int row =  (relativePosition != 1 ? (int)(relativePosition * gridSideLength) : (int)(relativePosition * gridSideLength));
        return row;
    }

    private byte getHashFromRowAndColumn(int row, int column){
        int hash = gridSideLength * column + row;
        return (byte) hash;
    }

    public boolean doesCollideWith(Vector position, double radius) {
        Vector rightEdge = position.clone();
        rightEdge.x += radius;
        Vector topEdge = position.clone();
        topEdge.y += radius;
        Vector leftEdge = position.clone();
        leftEdge.x -= radius;
        Vector bottomEdge = position.clone();
        bottomEdge.y -= radius;

        LinkedList<Vector> potentialPositionPoints = new LinkedList<>();
        int rightHash, topHash, leftHash, bottomHash;
        rightHash = topHash = leftHash = bottomHash = -4242;

        if(rightEdge.x <= boundingBox.maxX){
            int gridRow = getGridRow(rightEdge);
            int gridColumn = getGridColumn(rightEdge);
            rightHash = getHashFromRowAndColumn(gridRow, gridColumn);
            List<Vector> points = pointData.get((byte)rightHash);
            if(points != null){
                for (Vector p : points) {potentialPositionPoints.add(p);}
            }

        }
        if(topEdge.y <= boundingBox.maxY){
            int hash = getHashFromRowAndColumn(getGridRow(topEdge), getGridColumn(topEdge));
            if(hash != rightHash){
                topHash = hash;
                List<Vector> points = pointData.get((byte)topHash);
                if(points != null){
                    for (Vector p : points) {potentialPositionPoints.add(p);}
                }

            }
        }
        if(leftEdge.x >= boundingBox.minX){
            int hash = getHashFromRowAndColumn(getGridRow(leftEdge), getGridColumn(leftEdge));
            if(hash != rightHash && hash != topHash) {
                leftHash = hash;
                List<Vector> points = pointData.get((byte)leftHash);
                if(points != null){
                    for (Vector p : points) {potentialPositionPoints.add(p);}
                }
            }
        }
        if(bottomEdge.y >= boundingBox.minY){
            int hash = getHashFromRowAndColumn(getGridRow(bottomEdge), getGridColumn(bottomEdge));
            if(hash != rightHash && hash != topHash && hash != leftHash){
                bottomHash = hash;
                List<Vector> points = pointData.get((byte)bottomHash);
                if(points != null){
                    for (Vector p : points) {potentialPositionPoints.add(p);}
                }
            }
        }

        return doesCollideWith(position, potentialPositionPoints, radius);
    }

    public boolean doesCollideWith(Vector position, List<Vector> points, double radius){
        for(Vector p : points){
            if((position.x - p.x)*(position.x - p.x) + (position.y - p.y)*(position.y - p.y) < radius*radius){
                return true;
            }
        }
        return false;
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

    public void setOffset(float offset) {
        chunkByteBuffer.putFloat(BUFFER_OFFSET_POS, offset);
    }

    public boolean isJunk() {
        return chunkByteBuffer.getFloat(BUFFER_OFFSET_POS) >= snake.getLength();
    }
}