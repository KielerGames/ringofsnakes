import { SnakeChunkDTO } from "../dto/SnakeChunkDTO";
import Snake from "./Snake";
import * as FrameTime from "../../util/FrameTime";
import Rectangle from "../../math/Rectangle";
import Camera from "../camera/Camera";
import Vector from "../../math/Vector";
import { ManagedObject } from "../../util/ManagedMap";

/**
 * Main thread representation of a SnakeChunk.
 */
export default class SnakeChunk implements ManagedObject<number, SnakeChunkDTO> {
    readonly snake: Snake;
    readonly id: number;
    readonly end: Vector;

    private _final: boolean = false;
    private bounds: Rectangle;

    gpuData: GPUData;

    // offset prediction
    private lastUpdateTime: number;
    private lastPredictionTime: number;
    private lastKnownOffset: number;
    private predictedOffset: number;

    constructor(snake: Snake, dto: SnakeChunkDTO) {
        this.snake = snake;
        this.id = dto.id;
        this.end = Vector.fromObject(dto.end);
        snake.registerSnakeChunk(this);
        this.predictedOffset = dto.offset;
        this.lastPredictionTime = FrameTime.now();
        this.update(dto);
    }

    update(dto: SnakeChunkDTO): void {
        if (__DEBUG__ && this._final) {
            // can happen when the server thinks the client
            // does not know this chunk anymore
            console.info(`Update for final snake chunk ${this.id}.`);
        }
        this._final = dto.full;
        this.lastUpdateTime = FrameTime.now();
        this.lastKnownOffset = dto.offset;
        this.bounds = Rectangle.fromTransferable(dto.boundingBox);
        this.gpuData = {
            buffer: dto.data,
            vertices: dto.vertices
        };
    }

    updateOffset(offsetChange: number): void {
        if (__DEBUG__ && !this._final) {
            console.warn(`Offset change on non-final ${this.toString()}.`);
        }
        this.lastKnownOffset += offsetChange;
        this.lastUpdateTime = FrameTime.now();
    }

    /**
     * Predicts the offset of the chunk based on elapsed time and snake speed.
     */
    predict(): void {
        const speed = this.snake.speed;
        const now = FrameTime.now();

        // offset change assuming constant speed
        const change1 = (speed * (now - this.lastPredictionTime)) / 1000;
        const change2 = (speed * (now - this.lastUpdateTime)) / 1000;

        // predictions based on previous prediction (1) & last known data (2)
        const prediction1 = this.predictedOffset + change1;
        const prediction2 = this.lastKnownOffset + change2;

        // combine predictions
        this.predictedOffset = 0.85 * prediction1 + 0.15 * prediction2;
        this.lastPredictionTime = FrameTime.now();
    }

    isVisible(camera: Camera, epsilon: number = 0.0): boolean {
        const d = Rectangle.distance2(camera.viewBox, this.bounds);
        const ub = 0.5 * this.snake.width + epsilon;
        return d <= ub * ub;
    }

    /**
     * This is supposed to be called right before this chunk gets deleted.
     */
    destroy(): void {
        this.snake.unregisterSnakeChunk(this);
    }

    toString(): string {
        return `SnakeChunk ${this.id} of snake ${this.snake.id}`;
    }

    /**
     * Distance (along the snake path) between the start of this chunk and the snakes head.
     */
    get offset(): number {
        return this.predictedOffset;
    }

    get boundingBox(): Readonly<Rectangle> {
        return this.bounds;
    }

    get junk(): boolean {
        return this.lastKnownOffset >= this.snake.length;
    }

    /**
     * Is true if the path data is final (only the offset can change).
     */
    get final(): boolean {
        return this._final;
    }

    /**
     * The 16bit snake chunk id unique to the snake.
     */
    get shortId(): number {
        // eslint-disable-next-line no-bitwise
        return this.id & 0b1111111111111111;
    }

    get debugInfo(): string {
        if (__DEBUG__) {
            const time = Math.round(0.001 * (FrameTime.now() - this.lastUpdateTime));
            return [
                `SnakeChunk ${this.snake.id}-${this.shortId}`,
                `offset: ${Math.round(this.lastKnownOffset)} ~ ${Math.round(this.offset)}`,
                `updated ${time}s ago`
            ].join("\n");
        } else {
            // only allowed in debug mode
            throw new Error();
        }
    }
}

type GPUData = {
    buffer: Float32Array;
    vertices: number;
};
