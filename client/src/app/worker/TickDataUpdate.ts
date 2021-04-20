export type TickDataUpdate = {
    time: number;
    newChunks: SnakeChunkData[];
    //chunkOffsets: Map<ChunkId, number>;
    snakes: SnakeData[];
    cameraPosition: { x: number; y: number };
};

type ChunkId = number;

/* Vertex buffer triangle strip:
 *   3--2
 *   | /|
 *   |/ |
 *   2--1
 */
export type SnakeChunkData = {
    id: number;
    snakeId: number;

    data: Float32Array;
    vertices: number;
    boundingBox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };

    length: number;
    offset: number;
    final: boolean;
};

export type SnakeData = {
    id: number;
    length: number;
    skin: number;
    position: { x: number; y: number; };
    direction: number;
    speed: number;
}
