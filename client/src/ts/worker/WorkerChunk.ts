import BoundingBox from "../math/BoundingBox";
import Vector from "../math/Vector";
import { SnakeChunkData } from "../protocol/main-worker";
import assert from "../utilities/assert";
import {
    DecodedSnakeChunk,
    FULL_CHUNK_NUM_POINTS,
} from "./decoder/SnakeChunkDecoder";
import Snake from "./Snake";

const VERTEX_SIZE = 4;

export default class WorkerChunk {
    private snake: Snake;
    private chunkId: number;
    private _full: boolean;
    private pathData: Float32Array;
    private pathLength: number;
    private offset: number;
    private numPoints: number;
    private endPoint: Vector;
    private _final: boolean;
    private box: BoundingBox;

    public constructor(snake: Snake, data: DecodedSnakeChunk) {
        assert(snake.id === data.snakeId);
        this.snake = snake;
        this._full = data.full;
        this.numPoints = data.points;
        this.pathLength = data.pathLength;
        this.offset = data.pathOffset;

        if (data.full) {
            this._final = true;

            this.pathData = data.pathData;
        } else {
            this._final = false;

            // allocate memory once
            this.pathData = new Float32Array(FULL_CHUNK_NUM_POINTS * 4);
            // copy data
            this.pathData.set(data.pathData, 0);
        }

        assert(this.pathData instanceof Float32Array);
        assert(this.pathData.length % 4 === 0);

        this.box = createBoundingBox(this.pathData);
    }

    public createWebGlData(): SnakeChunkData {
        const vertices = this.numPoints;
        const buffer = new Float32Array(2 * VERTEX_SIZE * vertices);
        const snakeWidth = this.snake.width;

        for (let i = 0; i < vertices; i++) {
            const pdo = 4 * i;
            const x = this.pathData[pdo + 0];
            const y = this.pathData[pdo + 1];
            const offset = this.pathData[pdo + 2];
            const alpha = this.pathData[pdo + 3];
            addPointToVertexBuffer(buffer, i, x, y, alpha, snakeWidth, offset);
        }

        return {
            id: this.uniqueId,

            buffer: buffer.buffer,
            vertices,
            viewBox: this.box.createTransferable(0.5 * this.snake.width),

            end: this.endPoint.createTransferable(),

            length: this.pathLength,
            offset: this.offset,
            final: this.final,
        };
    }

    /**
     * Combination of snake & chunk id. Unique within the game.
     */
    public get uniqueId(): number {
        return (this.snake.id << 16) + this.chunkId;
    }

    /**
     * A chunk is final if it is full and all predictions have been corrected.
     */
    public get final(): boolean {
        return this._final;
    }

    public get full(): boolean {
        return this._full;
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

function createBoundingBox(pathData: Float32Array):BoundingBox {
    assert(pathData.length > 0);

    let minX, maxX, minY, maxY;
    minX = maxX = pathData[0];
    minY = maxY = pathData[1];

    for(let i=1; i<pathData.length; i++) {
        const x = pathData[4*i];
        const y = pathData[4*i+1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxX, y);
    }

    return new BoundingBox(minX, maxX, minY, maxY);
}
