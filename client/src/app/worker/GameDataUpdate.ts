import { FoodChunkDTO } from "./decoder/FoodDecoder";

export type GameDataUpdate = {
    timeSinceLastTick: number;
    ticksSinceLastMainThreadUpdate: number;
    newSnakeChunks: SnakeChunkData[];
    foodChunks: FoodChunkDTO[];
    snakes: SnakeData[];
    targetSnakeId: number;
};

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
    width: number;
    skin: number;
    position: { x: number; y: number };
    direction: number;
    targetDirection: number;
    speed: number;
    offsetCorrection: number;
};
