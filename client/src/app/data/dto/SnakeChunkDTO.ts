import { TransferableBox } from "../../math/Rectangle";

/* Vertex buffer triangle strip:
 *   3--2
 *   | /|
 *   |/ |
 *   2--1
 */
export type SnakeChunkDTO = {
    id: number;
    snakeId: number;

    data: Float32Array;
    vertices: number;
    boundingBox: TransferableBox;

    length: number;
    offset: number;
    final: boolean;
};
