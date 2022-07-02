import Vector from "../../math/Vector";
import { GameConfig } from "../config/GameConfig";
import { SnakeDTO } from "../dto/SnakeDTO";
import SnakeChunk from "./SnakeChunk";
import * as FrameTime from "../../util/FrameTime";
import { getMinDifference, normalizeAngle } from "../../math/Angle";
import { clamp } from "../../math/CommonFunctions";
import Camera from "../camera/Camera";
import Rectangle from "../../math/Rectangle";
import { ManagedObject } from "../../util/ManagedMap";

/**
 * Represents a snake on the main thread.
 */
export default class Snake implements ManagedObject<number, SnakeDTO, number> {
    readonly id: number;
    readonly skin: number;
    target: boolean = false;
    headChunk: SnakeChunk | null = null;

    private readonly chunks = new Map<number, SnakeChunk>();
    private lastUpdateTime: number;
    private lastPredictionTime: number;
    private headChunkId: number;
    private _length: number;
    private _fast: boolean;
    private _width: number;
    private _name: string;
    private _paused: boolean = false;
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
        this._fast = dto.fast;
        this._width = dto.width;
        if (dto.name) {
            this._name = dto.name;
        }

        if (this._paused) {
            this.predictedHeadPosition = Vector.fromObject(dto.headPosition);
            this.predictedDirection = dto.headDirection[0];
            this.lastPredictionTime = FrameTime.now();
            this._paused = false;
        }

        this.updateChunkOffsets(ticks, dto.fastHistory);
    }

    predict(): void {
        // predict snake head
        this.predictPosition();
        this.predictDirection();

        // predict body
        for (const snakeChunk of this.chunks.values()) {
            snakeChunk.predict();
        }

        // fix head chunk mesh
        const headChunk = this.headChunk;
        if (headChunk) {
            headChunk.connectMeshToHead();
        }

        this.lastPredictionTime = FrameTime.now();
    }

    registerSnakeChunk(chunk: SnakeChunk): void {
        if (__DEBUG__ && this.chunks.has(chunk.id)) {
            console.warn(`Snake ${this.id} already has a registered chunk with id ${chunk.id}.`);
        }
        this.chunks.set(chunk.id, chunk);
        if (chunk.id === this.headChunkId) {
            if (this.headChunk !== null) {
                this.headChunk.resetMesh();
            }
            this.headChunk = chunk;
        }
    }

    unregisterSnakeChunk(chunk: SnakeChunk): void {
        if (__DEBUG__ && !this.chunks.has(chunk.id)) {
            console.warn(`Snake ${this.id} has no chunk with id ${chunk.id}.`);
        }
        this.chunks.delete(chunk.id);
    }

    getSnakeChunksIterator(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    hasChunks(): boolean {
        return this.chunks.size > 0;
    }

    toString(): string {
        return `Snake ${this.id} with ${this.chunks.size} chunks`;
    }

    /**
     * True if the snake or some of its body is visible.
     */
    isVisible(camera: Camera, epsilon: number = 0.0): boolean {
        for (const chunk of this.chunks.values()) {
            if (chunk.isVisible(camera, epsilon)) {
                return true;
            }
        }

        return this.isHeadVisible(camera, epsilon);
    }

    /**
     * True if the head of the snake could be visible.
     * Checks if the bounding box of the snakes head is visible.
     */
    isHeadVisible(camera: Camera, epsilon: number = 0.0): boolean {
        const size = 2 * 2.0 * 1.25 * this._width;
        const headBox = Rectangle.createAt(this.predictedHeadPosition, size, size);

        return Rectangle.distance2(headBox, camera.viewBox) <= epsilon * epsilon;
    }

    destroy() {
        if (__DEBUG__ && this.hasChunks()) {
            console.warn(`Snake ${this.id} still had chunks when it was destroyed.`);
        }
    }

    /**
     * Pause snake movement until the next server update.
     */
    pause() {
        if (__DEBUG__ && !this._paused) {
            console.info(`Snake ${this.id} has been paused.`);
        }
        this._paused = true;
    }

    get name(): string {
        return this._name ?? `Snake ${this.id}`;
    }

    get fast(): boolean {
        return this._fast;
    }

    get length(): number {
        return this._length;
    }

    /**
     * The current snake speed in units per seconds (not units per tick).
     */
    get speed(): number {
        if (this._paused) {
            return 0.0;
        }
        const config = this.gameConfig;
        const tickSpeed = this._fast ? config.snakes.fastSpeed : config.snakes.speed;
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

        // predictions based on previous prediction (1) & last known data (2)
        this.predictedHeadPosition.addPolar(this.predictedDirection, distance1);
        const prediction2 = this.lastKnownHeadPosition.clone();
        prediction2.addPolar(this.predictedDirection, distance2);

        // combine predictions
        this.predictedHeadPosition = Vector.lerp(this.predictedHeadPosition, prediction2, 0.15);
    }

    private predictDirection() {
        const now = FrameTime.now();
        const maxChangePerSecond =
            this.gameConfig.snakes.maxTurnDelta / this.gameConfig.tickDuration;

        const d1 = getMinDifference(this.predictedDirection, this.targetDirection);
        const d2 = getMinDifference(this.lastKnownDirection, this.targetDirection);

        const max1 = (maxChangePerSecond * (now - this.lastPredictionTime)) / 1000;
        const max2 = (maxChangePerSecond * (now - this.lastUpdateTime)) / 1000;

        const p1 = normalizeAngle(this.predictedDirection + clamp(-max1, d1, max1));
        const p2 = normalizeAngle(this.lastKnownDirection + clamp(-max2, d2, max2));

        // combine predictions
        this.predictedDirection = normalizeAngle(p1 + 0.15 * getMinDifference(p1, p2));
    }

    private updateChunkOffsets(ticks: number, fastHistory: boolean[]) {
        if (ticks === 0) {
            return;
        }

        if (__DEBUG__ && fastHistory.length !== 8) {
            console.warn("unexpected fast history array", fastHistory);
        }

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
