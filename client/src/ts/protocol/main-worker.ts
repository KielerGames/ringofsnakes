import { GameConfig } from "./client-server";

/* Vertex buffer triangle strip:
 *   3--2
 *   | /|
 *   |/ |
 *   2--1
 */
export type SnakeChunkData = {
    id: number;

    buffer: ArrayBuffer;
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

export type SnakeInfo = {
    snakeId: number;
    skin: number;
    fast: boolean;
    length: number;
    direction: number;
    position: {
        x: number;
        y: number;
    };
};
