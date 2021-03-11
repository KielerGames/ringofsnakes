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
        HashSet<List<Vector>> set = new HashSet<>();
        set.add(points);
        assert (doesCollideWith(snake.headPosition, 10) == doesCollideWith(snake.headPosition, set, 10));
        if (doesCollideWith(snake.headPosition, 10)) {
            System.out.println("Collision");
        }

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
    }

    private int getGridColumn(Vector point) {
        double chunkWidth = boundingBox.maxX - boundingBox.minX;
        double relativePosition = (point.x - boundingBox.minX) / chunkWidth;
        int column = (int) relativePosition * gridSideLength;
        return column;
    }

    private int getGridRow(Vector point) {
        double chunkWidth = boundingBox.maxY - boundingBox.minY;
        double relativePosition = (point.y - boundingBox.minY) / chunkWidth;
        int row = (int) (relativePosition * gridSideLength);
        return row;
    }

    private byte getHashFromRowAndColumn(int row, int column) {
        int hash = gridSideLength * column + row;
        return (byte) hash;
    }

    public boolean doesCollideWith(Vector position, double radius) {
        HashSet<List<Vector>> potentialColliders = new HashSet<>();
        addSubChunkOfPointToSet(new Vector(position.x + radius, position.y), potentialColliders);
        addSubChunkOfPointToSet(new Vector(position.x, position.y + radius), potentialColliders);
        addSubChunkOfPointToSet(new Vector(position.x - radius, position.y), potentialColliders);
        addSubChunkOfPointToSet(new Vector(position.x, position.y - radius), potentialColliders);
        return doesCollideWith(position, potentialColliders, radius);
    }

    private void addSubChunkOfPointToSet(Vector point, HashSet<List<Vector>> set) {
        int gridRow = getGridRow(point);
        int gridColumn = getGridColumn(point);
        byte hash = getHashFromRowAndColumn(gridRow, gridColumn);
        if (pointData.get(hash) != null) {
            set.add(pointData.get(hash));
        }

    }

    private boolean doesCollideWith(Vector position, HashSet<List<Vector>> points, double radius) {
        for (List<Vector> l : points) {
            for (Vector p : l) {
                if ((position.x - p.x) * (position.x - p.x) + (position.y - p.y) * (position.y - p.y) < radius * radius) {
                    return true;
                }
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