import Rectangle from "../math/Rectangle";
import assert from "../utilities/assert";
import {
    DecodedSnakeChunk,
    FULL_CHUNK_NUM_POINTS
} from "./decoder/SnakeChunkDecoder";
import { SnakeChunkData } from "./GameDataUpdate";
import SnakeChunkVertexBufferBuilder from "./SnakeChunkVertexBufferBuilder";
import WorkerSnake from "./WorkerSnake";

const PATH_VERTEX_SIZE = 4;

export default class WorkerSnakeChunk {
    private snake: WorkerSnake;
    private id: number;
    private _full: boolean;
    private pathData: Float32Array;
    private pathLength: number;
    private offset: number;
    private numPoints: number;
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
            this.pathData = new Float32Array(
                FULL_CHUNK_NUM_POINTS * PATH_VERTEX_SIZE
            );
            // copy data
            this.pathData.set(data.pathData, 0);
        }

        assert(this.pathData instanceof Float32Array);
        assert(this.pathData.length % PATH_VERTEX_SIZE === 0);

        this.box = createBoundingBox(this.pathData);
    }

    public update(data: DecodedSnakeChunk): void {
        assert(data.points >= this.numPoints);
        assert(data.pathLength >= data.pathLength);

        this.pathData.set(data.pathData, 0); // TODO: copy only new data
        this.numPoints = data.points;

        this.pathLength = data.pathLength;
        this.offset = data.pathOffset;
        this._full = data.full;
        this._final = data.full; // TODO

        // TODO: update bounding box
    }

    public createTransferData(): SnakeChunkData {
        const points = this.numPoints;
        const bufferPoints = this.final ? points : points + 1;
        const builder = new SnakeChunkVertexBufferBuilder(
            bufferPoints,
            this.pathLength
        );

        const data = this.pathData;

        // create triangle strip vertices
        for (let i = 0; i < points; i++) {
            const pdo = PATH_VERTEX_SIZE * i;

            builder.addPoint(
                data[pdo + 0], // x
                data[pdo + 1], // y
                data[pdo + 3], // alpha
                data[pdo + 2] // path offset
            );
        }

        if (!this.final) {
            // continue line in direction of the snake
            const position = this.snake.position;
            builder.addPoint(
                position.x,
                position.y,
                this.snake.direction,
                this.pathLength
            );
        }

        return {
            id: this.id,
            snakeId: this.snake.id,

            data: builder.getBuffer(),
            vertices: 2 * bufferPoints,
            boundingBox: this.box.createTransferable(0.5 * this.snake.width),

            length: this.pathLength,
            offset: this.offset,
            final: this.final
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
    const N = PATH_VERTEX_SIZE;

    let minX, maxX, minY, maxY;
    minX = maxX = pathData[0];
    minY = maxY = pathData[1];

    for (let i = 1; i < pathData.length; i++) {
        const x = pathData[N * i];
        const y = pathData[N * i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxX, y);
    }

    return new Rectangle(minX, maxX, minY, maxY);
}
