import { SnakeChunkDTO } from "../dto/SnakeChunkDTO";
import Snake from "./Snake";
import * as FrameTime from "../../util/FrameTime";
import assert from "../../util/assert";
import Rectangle from "../../math/Rectangle";
import Camera from "../camera/Camera";

/**
 * Main thread representation of a SnakeChunk.
 */
export default class SnakeChunk {
    readonly snake: Snake;
    readonly id: number;

    private readonly creationTime: number;
    private final: boolean = false;
    private bounds: Rectangle;
    private length: number;

    gpuData: GPUData;

    // offset prediction
    private lastUpdateTime: number;
    private lastPredictionTime: number;
    private lastKnownOffset: number;
    private predictedOffset: number;

    constructor(snake: Snake, dto: SnakeChunkDTO) {
        this.snake = snake;
        this.id = dto.id;
        this.creationTime = FrameTime.now();
        snake.registerSnakeChunk(this);
        this.predictedOffset = dto.offset;
        this.lastPredictionTime = FrameTime.now();
        this.update(dto);
    }

    update(dto: SnakeChunkDTO): void {
        assert(!this.final);
        this.final = dto.full;
        this.lastUpdateTime = FrameTime.now();
        this.lastKnownOffset = dto.offset;
        this.bounds = Rectangle.fromTransferable(dto.boundingBox);
        this.gpuData = {
            buffer: dto.data,
            vertices: dto.vertices
        };
        this.length = dto.length;
    }

    updateOffset(offsetChange: number): void {
        if (__DEBUG__ && !this.final) {
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

        // predictions based on previous prediction & last known data
        const prediction1 = this.predictedOffset + change1;
        const prediction2 = this.lastKnownOffset + change2;

        // combine predictions
        this.predictedOffset = 0.85 * prediction1 + 0.15 * prediction2;
        this.lastPredictionTime = FrameTime.now();
    }

    isVisible(camera: Camera): boolean {
        const d = Rectangle.distance2(camera.viewBox, this.bounds);
        return d <= 0.5 * this.snake.width; // TODO consider prediction (?)
    }

    /**
     * This is supposed to be called right before this chunk gets deleted.
     */
    destroy(): void {
        this.snake.unregisterSnakeChunk(this);
    }

    toString(): string {
        const mask = (1 << 16) - 1;
        const id = this.id & mask;
        return `SnakeChunk ${id} of snake ${this.snake.id}`;
    }

    /**
     * Distance (along the snake path) between the start of this chunk and the snakes head.
     */
    get offset(): number {
        return this.predictedOffset;
    }

    /**
     * Age of this chunk in seconds.
     */
    get age(): number {
        return 0.001 * (FrameTime.now() - this.creationTime);
    }

    get boundingBox(): Readonly<Rectangle> {
        return this.bounds;
    }

    get junk(): boolean {
        return this.lastKnownOffset > this.length;
    }
}

type GPUData = {
    buffer: Float32Array;
    vertices: number;
};
