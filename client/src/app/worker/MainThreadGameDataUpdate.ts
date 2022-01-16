import { TransferableBox } from "../math/Rectangle";
import { LeaderboardData } from "../protocol";
import { FoodChunkDTO } from "./decoder/FoodDecoder";

export type MainThreadGameDataUpdate = {
    timeSinceLastTick: number;
    ticksSinceLastMainThreadUpdate: number;
    newSnakeChunks: SnakeChunkData[];
    foodChunks: FoodChunkDTO[];
    snakes: SnakeDataDTO[];
    targetSnakeId: number;
    leaderboardData: LeaderboardData;
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
    boundingBox: TransferableBox;

    length: number;
    offset: number;
    final: boolean;
};

export type SnakeDataDTO = {
    id: number;
    length: number;
    width: number;
    skin: number;
    position: { x: number; y: number };
    direction: number;
    targetDirection: number;
    speed: number; // in units per second (not per tick)
    offsetCorrection: number;
    headChunkId: number;
};
