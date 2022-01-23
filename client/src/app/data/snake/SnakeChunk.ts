import { SnakeChunkDTO } from "../dto/SnakeChunkDTO";
import Snake from "./Snake";
import * as FrameTime from "../../util/FrameTime";
import assert from "../../util/assert";
import Rectangle from "../../math/Rectangle";

/**
 * Main thread representation of a SnakeChunk.
 */
export default class SnakeChunk {
    readonly snake: Snake;
    readonly id: number;

    readonly #creationTime: number;
    #final: boolean = false;
    #boundingBox: Rectangle;
    #length: number;

    // buffer data
    #buffer: Float32Array;
    #vertices: number;

    // offset prediction
    #lastUpdateTime: number;
    #lastPredictionTime: number;
    #lastKnownOffset: number;
    #predictedOffset: number;

    constructor(snake: Snake, dto: SnakeChunkDTO) {
        this.snake = snake;
        this.id = dto.id;
        this.#creationTime = FrameTime.now();
        snake.registerSnakeChunk(this);
        this.#predictedOffset = dto.offset;
        this.#lastPredictionTime = FrameTime.now();
        this.update(dto);
    }

    update(dto: SnakeChunkDTO): void {
        assert(!this.#final);
        this.#final = dto.final;
        this.#lastUpdateTime = FrameTime.now();
        this.#lastKnownOffset = dto.offset;
        this.#boundingBox = Rectangle.fromTransferable(dto.boundingBox);
        this.#buffer = dto.data;
        this.#vertices = dto.vertices;
        this.#length = dto.length;
    }

    updateOffset(offsetChange: number): void {
        if (__DEBUG__ && !this.#final) {
            console.warn(`Offset change on non-final chunk.`);
        }
        this.#lastKnownOffset += offsetChange;
        this.#lastUpdateTime = FrameTime.now();
    }

    /**
     * Predicts the offset of the chunk based on elapsed time and snake speed.
     */
    predict(): void {
        const speed = this.snake.speed;
        const now = FrameTime.now();

        // offset change assuming constant speed
        const change1 = (speed * (now - this.#lastPredictionTime)) / 1000;
        const change2 = (speed * (now - this.#lastUpdateTime)) / 1000;

        // predictions based on previous prediction & last known data
        const prediction1 = this.#predictedOffset + change1;
        const prediction2 = this.#lastKnownOffset + change2;

        // combine predictions
        this.#predictedOffset = 0.85 * prediction1 + 0.15 * prediction2;
        this.#lastPredictionTime = FrameTime.now();
    }

    /**
     * Distance (along the snake path) between the start of this chunk and the snakes head.
     */
    get offset(): number {
        return this.#predictedOffset;
    }

    /**
     * Age of this chunk in seconds.
     */
    get age(): number {
        return 0.001 * (FrameTime.now() - this.#creationTime);
    }
}
