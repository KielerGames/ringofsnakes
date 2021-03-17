import BoundingBox from "../math/BoundingBox";
import Vector from "../math/Vector";
import { SnakeChunkData } from "../protocol/main-worker";
import assert from "../utilities/assert";
import { DecodedSnakeChunk, FULL_CHUNK_NUM_POINTS } from "./decoder/SnakeChunkDecoder";
import Snake from "./Snake";

const VERTEX_SIZE = 4;

export default class WorkerChunk {
    private snake: Snake;
    private chunkId: number;
    private full:boolean;
    private pathData:Float32Array;
    private numPoints:number;
    private endPoint:Vector;
    private _final:boolean;
    private box:BoundingBox;

    public constructor(snake: Snake, data: DecodedSnakeChunk) {
        assert(snake.id === data.snakeId);
        this.snake = snake;
        this.full = data.full;

        if(data.full) {
            this.pathData = data.pathData;
            this._final = true;
        } else {
            this.pathData = new Float32Array(FULL_CHUNK_NUM_POINTS * 2);
            this._final = false;
        }
    }

    public createWebGlData(): SnakeChunkData {
        const vertices = this.full ? this.numPoints : (this.numPoints + 1);
        const buffer = new Float32Array(2 * VERTEX_SIZE * vertices);

        return {
            id: this.uniqueId,

            buffer: buffer.buffer,
            vertices,
            viewBox: this.box.createTransferable(0.5 * this.snake.width),

            end: this.endPoint.createTransferable(),

            length: 0,
            offset: 0,
            final: this.final
        };
    }

    /**
     * Combination of snake & chunk id. Unique within the game.
     */
    public get uniqueId():number {
        return (this.snake.id<<16) + this.chunkId;
    }

    /**
     * A chunk is final if it is full and all predictions have been corrected.
     */
    public get final():boolean {
        return this._final;
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
