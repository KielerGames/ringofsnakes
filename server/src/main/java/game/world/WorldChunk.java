package game.world;

import math.BoundingBox;

import java.util.Optional;

public class WorldChunk {
    private NeighborList neighbors;
    private BoundingBox box;
    private Optional<WorldChunk[]> children;

    public WorldChunk(double left, double bottom, double width, double height) {
        this(new BoundingBox(left, left + width, bottom, bottom + height));
    }

    public WorldChunk(BoundingBox box) {
        this.box = box;
        this.children = Optional.empty();
    }

    public void subdivide(int levels) {
        assert (levels > 0);

/*        WorldChunk[] children = new WorldChunk[4];
        final double width = box.getWidth(), height = box.getHeight();

        children[0] = new WorldChunk(new BoundingBox(box.minX, ))

        this.children = Optional.of(children);*/

        throw new UnsupportedOperationException("Not yet implemented.");
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
