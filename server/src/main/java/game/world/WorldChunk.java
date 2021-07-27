package game.world;

import game.snake.SnakeChunkData;
import math.BoundingBox;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WorldChunk {
    private NeighborList neighbors;
    private BoundingBox box;
    private List<SnakeChunkData> snakeChunks;

    /**
     * children indices:
     * 2, 3
     * 0, 1
     */
    private WorldChunk[] children;

    public WorldChunk(double width, double height, int subdivisions) {
        this(-0.5 * width, -0.5 * height, width, height);
        if (subdivisions > 0) {
            subdivide(subdivisions);
        }
        setNeighbors(null, null, null, null, null, null, null, null);
    }

    private WorldChunk(double left, double bottom, double width, double height) {
        assert (width > 0.0);
        assert (height > 0.0);

        snakeChunks = new LinkedList<>();
        neighbors = new NeighborList();
        box = new BoundingBox(left, left + width, bottom, bottom + height);
        children = new WorldChunk[0];
    }

    private void subdivide(int subdivisions) {
        assert (subdivisions > 0);
        assert (children.length == 0);

        final double left = box.minX, bottom = box.minY;
        final double width = 0.5 * box.getWidth();
        final double height = 0.5 * box.getHeight();

        children = new WorldChunk[4];
        children[0] = new WorldChunk(left, bottom, width, height);
        children[1] = new WorldChunk(left + width, bottom, width, height);
        children[2] = new WorldChunk(left, bottom + height, width, height);
        children[3] = new WorldChunk(left + width, bottom + height, width, height);

        if (subdivisions > 1) {
            for (WorldChunk childChunk : children) {
                childChunk.subdivide(subdivisions - 1);
            }
        }
    }

    /**
     * ┌──┬──┬──┬──┬──┬──┐
     * │ 2│3 │ 2│3 │ 2│3 │
     * ├─NW──┼──N──┼─NE──┤
     * │ 0│1 │ 0│1 │ 0│1 │
     * ├──┼──┼──┼──┼──┼──┤
     * │ 2│3 │ 2│3 │ 2│3 │
     * ├──W──┼──X──┼──E──┤
     * │ 0│1 │ 0│1 │ 0│1 │
     * ├──┼──┼──┼──┼──┼──┤
     * │ 2│3 │ 2│3 │ 2│3 │
     * ├─SW──┼──S──┼─SE──┤
     * │ 0│1 │ 0│1 │ 0│1 │
     * └──┴──┴──┴──┴──┴──┘
     */
    private void setNeighbors(WorldChunk east, WorldChunk northEast, WorldChunk north, WorldChunk northWest,
                              WorldChunk west, WorldChunk southWest, WorldChunk south, WorldChunk southEast) {
        neighbors.east = east != null ? east : neighbors.east;
        neighbors.northEast = northEast != null ? northEast : neighbors.northEast;
        neighbors.north = north != null ? north : neighbors.north;
        neighbors.northWest = northWest != null ? northWest : neighbors.northWest;
        neighbors.west = west != null ? west : neighbors.west;
        neighbors.southWest = southWest != null ? southWest : neighbors.southWest;
        neighbors.south = south != null ? south : neighbors.south;
        neighbors.southEast = southEast != null ? southEast : neighbors.southEast;

        if (children.length == 4) {
            // outer neighbors
            if (east != null) {
                children[1].neighbors.east = east.children[0];
                children[1].neighbors.northEast = east.children[2];
                children[3].neighbors.east = east.children[2];
                children[3].neighbors.southEast = east.children[0];
            }
            if (northEast != null) {
                children[3].neighbors.northEast = northEast.children[0];
            }
            if (north != null) {
                children[3].neighbors.north = north.children[1];
                children[3].neighbors.northWest = north.children[0];
                children[2].neighbors.north = north.children[0];
                children[2].neighbors.northEast = north.children[1];
            }
            if (northWest != null) {
                children[2].neighbors.northWest = northWest.children[1];
            }
            if (west != null) {
                children[2].neighbors.west = west.children[3];
                children[2].neighbors.southWest = west.children[1];
                children[0].neighbors.west = west.children[1];
                children[0].neighbors.northWest = west.children[3];
            }
            if (southWest != null) {
                children[0].neighbors.southWest = southWest.children[3];
            }
            if (south != null) {
                children[0].neighbors.south = south.children[2];
                children[0].neighbors.southEast = south.children[3];
                children[1].neighbors.south = south.children[3];
                children[1].neighbors.southWest = south.children[2];
            }
            if (southEast != null) {
                children[1].neighbors.southEast = southEast.children[2];
            }

            // inner neighbors
            children[0].setNeighbors(children[1], children[3], children[2], null, null, null, null, null);
            children[1].setNeighbors(null, null, children[3], children[2], children[0], null, null, null);
            children[2].setNeighbors(children[3], null, null, null, null, null, children[0], children[1]);
            children[3].setNeighbors(null, null, null, null, children[2], children[0], children[1], null);
        }
    }

    public List<WorldChunk> getChildren() {
        return List.of(children);
    }

    public List<WorldChunk> getNeighbors() {
        return Stream.of(neighbors.east, neighbors.northEast, neighbors.north, neighbors.northWest,
                        neighbors.west, neighbors.southWest, neighbors.south, neighbors.southEast)
                .filter(Objects::nonNull)
                .collect(Collectors.toUnmodifiableList());
    }

    public void addSnakeChunk(SnakeChunkData snakeChunk) {
        if (children.length > 0) {
            int n = 0;

            for (WorldChunk childChunk : children) {
                if (BoundingBox.intersect(childChunk.box, snakeChunk.getBoundingBox())) {
                    childChunk.addSnakeChunk(snakeChunk);
                    n++;
                }
            }

            assert (n > 0);
        } else {
            snakeChunks.add(snakeChunk);
            snakeChunk.linkWorldChunk(this);
        }
    }

    public void removeSnakeChunk(SnakeChunkData snakeChunk) {
        assert (children.length == 0);
        snakeChunks.remove(snakeChunk);
    }

    private static class NeighborList {
        public WorldChunk east, northEast, north, northWest, west, southWest, south, southEast;
    }
}
