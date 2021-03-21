import Rectangle from "../math/Rectangle";
import Vector from "../math/Vector";
import { SnakeChunkData } from "../protocol/main-worker";
import assert from "../utilities/assert";
import {
    DecodedSnakeChunk,
    FULL_CHUNK_NUM_POINTS,
} from "./decoder/SnakeChunkDecoder";
import SnakeChunkVertexBufferBuilder from "./SnakeChunkVertexBufferBuilder";
import WorkerSnake from "./WorkerSnake";

const VERTEX_SIZE = 4;

export default class WorkerChunk {
    private snake: WorkerSnake;
    private id: number;
    private _full: boolean;
    private pathData: Float32Array;
    private pathLength: number;
    private offset: number;
    private numPoints: number;
    private endPoint: Vector;
    private _final: boolean;
    private box: Rectangle;

    public constructor(snake: WorkerSnake, data: DecodedSnakeChunk) {
        assert(snake.id === data.snakeId);
        this.id = data.chunkId;
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
        const points = this.numPoints;
        const buffer = new SnakeChunkVertexBufferBuilder(points);

        // create triangle strip vertices
        for (let i = 0; i < points; i++) {
            const pdo = 4 * i;
            const x = this.pathData[pdo + 0];
            const y = this.pathData[pdo + 1];
            const endOffset = this.pathData[pdo + 2];
            const startOffset = this.pathLength - endOffset;
            const alpha = this.pathData[pdo + 3];
            buffer.addPoint(x, y, alpha, startOffset);
        }

        return {
            id: this.id,

            buffer: buffer.finalize(),
            vertices: points,
            boundingBox: this.box.createTransferable(0.5 * this.snake.width),

            length: this.pathLength,
            offset: this.offset,
            final: this.final,
        };
    }

    /**
     * A chunk is final if it is full and all predictions have been corrected.
     */
    public get final(): boolean {
        return this._final;
    }

    /**
     * A chunk is full if numPoints has reached the maximum number of points.
     */
    public get full(): boolean {
        return this._full;
    }
}

function createBoundingBox(pathData: Float32Array): Rectangle {
    assert(pathData.length > 0);

    let minX, maxX, minY, maxY;
    minX = maxX = pathData[0];
    minY = maxY = pathData[1];

    for (let i = 1; i < pathData.length; i++) {
        const x = pathData[4 * i];
        const y = pathData[4 * i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxX, y);
    }

    return new Rectangle(minX, maxX, minY, maxY);
}
