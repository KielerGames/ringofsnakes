import { SnakeChunkData } from "../protocol/main-worker";
import Snake from "./Snake";

const VERTEX_SIZE = 4;

export default class NonFinalChunk {
    private snake: Snake;
    private chunkId: number;
    private full:boolean;
    private points:Float32Array;

    public constructor() {

    }

    public createWebGlVertexBuffer(): SnakeChunkData {
        const vertices = 42; //TODO
        const buffer = new Float32Array(2 * VERTEX_SIZE * vertices);

        return {
            id: this.uniqueId,

            buffer: buffer.buffer,
            vertices,
            viewBox: {
                minX: NaN,
                maxX: NaN,
                minY: NaN,
                maxY: NaN
            },

            end: {
                x: NaN,
                y: NaN
            },

            length: 0,
            offset: 0,
            final: false //TODO
        };
    }

    public get uniqueId():number {
        return (this.snake.id<<16) + this.chunkId;
    }
}

function addPointToVertexBuffer(
    vb: Float32Array,
    k: number,
    x: number,
    y: number,
    alpha: number,
    width: number,
    pathOffset: number
): void {
    const normalAlpha = alpha - 0.5 * Math.PI;

    // compute normal vector
    const nx = Math.cos(normalAlpha);
    const ny = Math.sin(normalAlpha);

    // vertex buffer offset
    const vbo = 2 * VERTEX_SIZE * k;

    // right vertex
    vb[vbo + 0] = x + width * nx;
    vb[vbo + 1] = y + width * ny;
    vb[vbo + 2] = pathOffset;
    vb[vbo + 3] = 1.0;

    // left vertex
    vb[vbo + 4] = x - width * nx;
    vb[vbo + 5] = y - width * ny;
    vb[vbo + 6] = pathOffset;
    vb[vbo + 7] = -1.0;
}
