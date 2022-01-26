import Vector from "../../math/Vector";
import { GameConfig } from "../config/GameConfig";
import { SnakeDTO } from "../dto/SnakeDTO";
import SnakeChunk from "./SnakeChunk";
import * as FrameTime from "../../util/FrameTime";
import { getMinDifference, normalizeAngle } from "../../math/Angle";
import { clamp } from "../../math/CommonFunctions";

/**
 * Represents a snake on the main thread.
 */
export default class Snake {
    readonly id: number;
    readonly skin: number;
    target: boolean = false;
    private readonly chunks = new Map<number, SnakeChunk>();
    private lastUpdateTime: number;
    private lastPredictionTime: number;
    private headChunkId: number;
    private _length: number;
    private fast: boolean;
    private _width: number;
    private gameConfig: GameConfig;

    // head position & interpolation
    private lastKnownHeadPosition: Vector;
    private predictedHeadPosition: Vector;

    // head direction & interpolation
    private lastKnownDirection: number;
    private predictedDirection: number;
    private targetDirection: number;

    constructor(dto: SnakeDTO, config: GameConfig) {
        this.id = dto.id;
        this.skin = dto.skin;
        this.gameConfig = config;
        this.lastPredictionTime = FrameTime.now();

        this.predictedHeadPosition = Vector.fromObject(dto.headPosition);
        this.predictedDirection = dto.headDirection[0];

        this.update(dto, 0);
    }

    /**
     * Update main thread snake data with new server data.
     * @param dto Decoded update data.
     */
    update(dto: SnakeDTO, ticks: number): void {
        this.lastUpdateTime = FrameTime.now();
        this._length = dto.length;
        this.headChunkId = dto.headChunkId;
        this.lastKnownHeadPosition = Vector.fromObject(dto.headPosition);
        this.lastKnownDirection = dto.headDirection[0];
        this.targetDirection = dto.headDirection[1];
        this.fast = dto.fast;
        this._width = dto.width;

        this.updateChunkOffsets(ticks, dto.fastHistory);
    }

    predict(): void {
        this.predictPosition();
        this.predictDirection();

        for (const snakeChunk of this.chunks.values()) {
            snakeChunk.predict();
        }

        this.lastPredictionTime = FrameTime.now();
    }

    registerSnakeChunk(chunk: SnakeChunk): void {
        this.chunks.set(chunk.id, chunk);
    }

    unregisterSnakeChunk(chunk: SnakeChunk): void {
        this.chunks.delete(chunk.id);
    }

    getSnakeChunksIterator(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    hasChunks(): boolean {
        return this.chunks.size > 0;
    }

    toString(): string {
        const speed = this.fast ? "f" : "s";
        return `(${speed}) Snake ${this.id} with ${this.chunks.size} chunks`;
    }

    get headChunk(): SnakeChunk | undefined {
        return this.chunks.get(this.headChunkId);
    }

    get name(): string {
        return "A Snake With No Name"; // TODO
    }

    get length(): number {
        return this._length;
    }

    /**
     * The current snake speed in units per seconds (not units per tick).
     */
    get speed(): number {
        const config = this.gameConfig;
        const tickSpeed = this.fast
            ? config.snakes.fastSpeed
            : config.snakes.speed;
        return tickSpeed / config.tickDuration;
    }

    /**
     * Get the last predicted position.
     */
    get position(): Vector {
        return this.predictedHeadPosition;
    }

    /**
     * Get the direction the snakes head is facing (in radians).
     */
    get direction(): number {
        return this.predictedDirection;
    }

    /**
     * Get the maximum (tail gets thinner) width of the snake.
     */
    get width(): number {
        return this._width;
    }

    private predictPosition() {
        const speed = this.speed;
        const now = FrameTime.now();

        const distance1 = (speed * (now - this.lastPredictionTime)) / 1000;
        const distance2 = (speed * (now - this.lastUpdateTime)) / 1000;

        // predictions based on previous prediction & last known data
        const prediction = this.lastKnownHeadPosition.clone();
        prediction.addPolar(this.predictedDirection, distance1);
        this.predictedHeadPosition.addPolar(this.predictedDirection, distance2);

        // combine predictions
        this.predictedHeadPosition = Vector.lerp(
            prediction,
            this.predictedHeadPosition,
            0.85
        );
    }

    private predictDirection() {
        const now = FrameTime.now();
        const maxChangePerSecond =
            this.gameConfig.snakes.maxTurnDelta / this.gameConfig.tickDuration;

        const d1 = getMinDifference(
            this.predictedDirection,
            this.targetDirection
        );
        const d2 = getMinDifference(
            this.lastKnownDirection,
            this.targetDirection
        );

        const max1 =
            (maxChangePerSecond * (now - this.lastPredictionTime)) / 1000;
        const max2 = (maxChangePerSecond * (now - this.lastUpdateTime)) / 1000;

        const p1 = normalizeAngle(
            this.predictedDirection + clamp(-max1, d1, max1)
        );
        const p2 = normalizeAngle(
            this.lastKnownDirection + clamp(-max2, d2, max2)
        );

        // combine predictions
        this.predictedDirection = normalizeAngle(
            p1 + 0.15 * getMinDifference(p1, p2)
        );
    }

    private updateChunkOffsets(ticks: number, fastHistory: boolean[]) {
        const fastSpeed = this.gameConfig.snakes.fastSpeed;
        const slowSpeed = this.gameConfig.snakes.speed;

        let chunkOffset = 0;

        for (let i = 0; i < ticks; i++) {
            chunkOffset += fastHistory[i] ? fastSpeed : slowSpeed;
        }

        for (const chunk of this.chunks.values()) {
            if (chunk.id === this.headChunkId) {
                continue;
            }

            chunk.updateOffset(chunkOffset);
        }
    }
}
