import { TransferableBox } from "../../math/Rectangle";
import { VectorLike } from "../../math/Vector";

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
    boundingBox: TransferableBox; // ignores the snake width
    end: VectorLike;

    length: number;
    offset: number;
    full: boolean;
};
