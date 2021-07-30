package game.world;

import math.Vector;

public class WorldChunkFactory {
    private WorldChunkFactory() {
    }

    public static WorldChunkCollection createChunks(double chunkSize, int rows, int columns) {
        assert (chunkSize > 0.0);
        assert (rows > 0 && columns > 0);

        var chunks = new WorldChunk[rows * columns];
        var offsetX = -0.5 * (columns * chunkSize);
        var offsetY = -0.5 * (rows * chunkSize);

        // create chunks
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                chunks[getIndex(i, j, columns)] = new WorldChunk(
                        offsetX + j * chunkSize,
                        offsetY + i * chunkSize,
                        chunkSize, chunkSize,
                        j, i
                );
            }
        }

        // set up neighbors
        // iterate over chunks
        for (int ci = 0; ci < rows; ci++) {
            for (int cj = 0; cj < columns; cj++) {
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
                        if (i < 0 || j < 0 || i >= rows || j >= columns) {
                            continue;
                        }

                        chunks[getIndex(ci, cj, columns)].addNeighbor(chunks[getIndex(i, j, columns)]);
                    }
                }
            }
        }

        final double width = columns * chunkSize;
        final double height = rows * chunkSize;

        return new WorldChunkCollection(chunks) {
            @Override
            protected int findChunkIndex(Vector point) {
                int x = (int) ((point.x - offsetX) / chunkSize);
                int y = (int) ((point.y - offsetY) / chunkSize);

                if (x < 0 || y < 0 || x >= columns || y >= rows) {
                    throw new IllegalArgumentException("Point is out of bounds.");
                }

                return getIndex(y, x, columns);
            }
        };
    }

    private static int getIndex(int row, int col, int columns) {
        return row * columns + col;
    }
}
