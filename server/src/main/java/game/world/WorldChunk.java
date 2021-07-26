package game.world;

import math.BoundingBox;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WorldChunk {
    private NeighborList neighbors;
    private BoundingBox box;
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
        setNeighbors(null, null, null, null);
    }

    private WorldChunk(double left, double bottom, double width, double height) {
        assert (width > 0.0);
        assert (height > 0.0);

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

    private void setNeighbors(WorldChunk top, WorldChunk bottom, WorldChunk left, WorldChunk right) {
        neighbors.top = top != null ? top : neighbors.top;
        neighbors.bottom = bottom != null ? bottom : neighbors.bottom;
        neighbors.left = left != null ? left : neighbors.left;
        neighbors.right = right != null ? right : neighbors.right;

        if (children.length == 4) {
            // outer neighbors
            if (left != null) {
                children[0].neighbors.left = left.children[1];
                children[2].neighbors.left = left.children[3];
            }
            if (right != null) {
                children[1].neighbors.right = right.children[0];
                children[3].neighbors.right = right.children[2];
            }
            if (bottom != null) {
                children[0].neighbors.bottom = bottom.children[2];
                children[1].neighbors.bottom = bottom.children[3];
            }
            if (top != null) {
                children[2].neighbors.top = top.children[0];
                children[3].neighbors.top = top.children[1];
            }

            // inner neighbors
            children[0].setNeighbors(children[2], null, null, children[1]);
            children[1].setNeighbors(children[3], null, children[0], null);
            children[2].setNeighbors(null, children[0], null, children[3]);
            children[3].setNeighbors(null, children[1], children[2], null);
        }
    }

    public List<WorldChunk> getChildren() {
        return List.of(children);
    }

    public List<WorldChunk> getNeighbors() {
        return Stream.of(neighbors.top, neighbors.bottom, neighbors.left, neighbors.right)
                .filter(Objects::nonNull)
                .collect(Collectors.toUnmodifiableList());
    }

    private static class NeighborList {
        public WorldChunk top, bottom, left, right;
    }
}
