import Vector from "../../math/Vector";
import { GameConfig } from "../config/GameConfig";
import { SnakeDTO } from "../dto/SnakeDTO";
import SnakeChunk from "./SnakeChunk";
import * as FrameTime from "../../util/FrameTime";

/**
 * Represents a snake on the main thread.
 */
export default class Snake {
    readonly id: number;
    readonly skin: number;
    readonly #chunks = new Map<number, SnakeChunk>();
    #lastUpdateTime: number;
    #lastPredictionTime: number;
    #headChunkId: number;
    #length: number;
    #fast: boolean;
    #width: number;
    #gameConfig: GameConfig;

    // head position & interpolation
    #lastKnownHeadPosition: Vector;
    #predictedHeadPosition: Vector;

    // head direction & interpolation
    #lastKnownDirection: number;
    #predictedDirection: number;
    #targetDirection: number;

    constructor(dto: SnakeDTO, config: GameConfig) {
        this.id = dto.id;
        this.skin = dto.skin;
        this.#gameConfig = config;
        this.#lastPredictionTime = FrameTime.now();

        this.#predictedHeadPosition = Vector.fromObject(dto.headPosition);
        this.#predictedDirection = dto.headDirection[0];

        this.update(dto, 0);
    }

    /**
     * Update main thread snake data with new server data.
     * @param dto Decoded update data.
     */
    update(dto: SnakeDTO, ticks: number): void {
        this.#lastUpdateTime = FrameTime.now();
        this.#length = dto.length;
        this.#headChunkId = dto.headChunkId;
        this.#lastKnownHeadPosition = Vector.fromObject(dto.headPosition);
        this.#lastKnownDirection = dto.headDirection[0];
        this.#targetDirection = dto.headDirection[1];
        this.#fast = dto.fast;
        this.#width = dto.width;
        // TODO: use fast history for chunk offset correction
    }

    predict(): void {
        // predict position
        const speed = this.speed;
        const distance1 =
            (speed * (FrameTime.now() - this.#lastPredictionTime)) / 1000;
        const distance2 =
            (speed * (FrameTime.now() - this.#lastUpdateTime)) / 1000;

        const prediction = this.#lastKnownHeadPosition.clone();
        prediction.addPolar(this.#predictedDirection, distance1);
        this.#predictedHeadPosition.addPolar(
            this.#predictedDirection,
            distance2
        );

        this.#predictedHeadPosition = Vector.lerp(
            prediction,
            this.#predictedHeadPosition,
            0.85
        );

        // predict direction
        // TODO
        this.#predictedDirection = this.#lastKnownDirection;

        for (const snakeChunk of this.#chunks.values()) {
            snakeChunk.predict();
        }
    }

    registerSnakeChunk(chunk: SnakeChunk): void {
        this.#chunks.set(chunk.id, chunk);
    }

    getSnakeChunksIterator(): IterableIterator<SnakeChunk> {
        return this.#chunks.values();
    }

    hasChunks(): boolean {
        return this.#chunks.size > 0;
    }

    get headChunk(): SnakeChunk | undefined {
        return this.#chunks.get(this.#headChunkId);
    }

    get name(): string {
        return "A Snake With No Name"; // TODO
    }

    get length(): number {
        return this.#length;
    }

    /**
     * The current snake speed in units per seconds (not units per tick).
     */
    get speed(): number {
        const config = this.#gameConfig;
        const tickSpeed = this.#fast
            ? config.snakes.fastSpeed
            : config.snakes.speed;
        return tickSpeed / config.tickDuration;
    }

    /**
     * Get the last predicted position.
     */
    get position(): Vector {
        return this.#predictedHeadPosition;
    }

    /**
     * Get the direction the snakes head is facing (in radians).
     */
    get direction(): number {
        return this.#predictedDirection;
    }

    /**
     * Get the maximum (tail gets thinner) width of the snake.
     */
    get width(): number {
        return this.#width;
    }
}
