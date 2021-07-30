package game.world;

import math.Vector;

public class WorldChunkFactory {
    private WorldChunkFactory() {
    }

    public static WorldChunkCollection createChunks(double chunkSize, int n, int m) {
        assert (chunkSize > 0.0);
        assert (n > 0 && m > 0);

        var chunks = new WorldChunk[n * m];
        var offsetX = -0.5 * (m * chunkSize);
        var offsetY = -0.5 * (n * chunkSize);

        // create chunks
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                chunks[getIndex(i, j, m)] = new WorldChunk(
                        offsetX + j * chunkSize,
                        offsetY + i * chunkSize,
                        chunkSize, chunkSize
                );
            }
        }

        // set up neighbors
        // iterate over chunks
        for (int ci = 0; ci < n; ci++) {
            for (int cj = 0; cj < m; cj++) {
                // x & y offset
                for (int nx = -1; nx <= 1; nx++) {
                    for (int ny = -1; ny <= 1; ny++) {
                        // skip the chunk itself
                        if (nx == 0 && ny == 0) {
                            continue;
                        }

                        // neighbor index
                        final int i = ci + ny;
                        final int j = cj + nx;

                        // skip out-of-bounds neighbors
                        if (i < 0 || j < 0 || i >= n || j >= m) {
                            continue;
                        }

                        chunks[getIndex(ci, cj, m)].addNeighbor(chunks[getIndex(i, j, m)]);
                    }
                }
            }
        }

        final double width = m * chunkSize;
        final double height = n * chunkSize;

        return new WorldChunkCollection(chunks) {
            @Override
            protected int findChunkIndex(Vector point) {
                int x = (int) ((point.x - offsetX) / chunkSize);
                int y = (int) ((point.y - offsetY) / chunkSize);

                if (x < 0 || y < 0 || x >= m || y >= n) {
                    throw new IllegalArgumentException("Point is out of bounds.");
                }

                return getIndex(y, x, m);
            }
        };
    }

    private static int getIndex(int row, int col, int columns) {
        return row * columns + col;
    }
}
