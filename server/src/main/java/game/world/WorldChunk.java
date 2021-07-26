package game.world;

import math.BoundingBox;

import java.util.Optional;

public class WorldChunk {
    private NeighborList neighbors;
    private BoundingBox box;
    private WorldChunk[] children;

    public WorldChunk(double width, double height, int subdivisions) {
        this(-0.5 * width, -0.5 * height, width, height);
        subdivide(subdivisions);
    }

    private WorldChunk(double left, double bottom, double width, double height) {
        assert (width > 0.0);
        assert (height > 0.0);

        box = new BoundingBox(left, left + width, bottom, bottom + height);
        children = new WorldChunk[0];
    }

    private void subdivide(int subdivisions) {
        assert (subdivisions >= 0);

        final double left = box.minX, bottom = box.minY;
        final double width = 0.5 * box.getWidth();
        final double height = 0.5 * box.getHeight();

        /* create children:
         * 2, 3
         * 0, 1
         */
        children = new WorldChunk[4];
        children[0] = new WorldChunk(left, bottom, width, height);
        children[1] = new WorldChunk(left + width, bottom, width, height);
        children[2] = new WorldChunk(left, bottom + height, width, height);
        children[3] = new WorldChunk(left + width, bottom + height, width, height);

        // link neighbors
        children[0].setNeighbors(children[2], null, null, children[1]);
        children[1].setNeighbors(children[3], null, children[0], null);
        children[2].setNeighbors(null, children[0], null, children[3]);
        children[3].setNeighbors(null, children[1], children[2], null);
        // TODO: outer neighbors
    }

    public void setNeighbors(WorldChunk top, WorldChunk bottom, WorldChunk left, WorldChunk right) {
        this.neighbors = new NeighborList(top, bottom, left, right);
    }

    private static class NeighborList {
        // TODO: use Optional or null ?
        public Optional<WorldChunk> top, bottom, left, right;

        NeighborList(WorldChunk top, WorldChunk bottom, WorldChunk left, WorldChunk right) {
            this.top = Optional.ofNullable(top);
            this.bottom = Optional.ofNullable(bottom);
            this.left = Optional.ofNullable(left);
            this.right = Optional.ofNullable(right);
        }
    }
}
