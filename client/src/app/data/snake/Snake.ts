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

// eslint-disable-next-line no-bitwise
const CHUNK_ID_MASK = (1 << 16) - 1;

/**
 * Represents a snake on the main thread.
 */
export default class Snake implements ManagedObject<number, SnakeDTO, number> {
    readonly id: number;
    readonly skin: number;
    target: boolean = false;
    headChunk: SnakeChunk | null = null;

    private readonly gameConfig: GameConfig;
    private readonly chunks: SnakeChunk[] = [];
    private readonly chunkIds = new Set<SnakeChunk["id"]>();
    private lastUpdateTime: number;
    private lastPredictionTime: number;
    private headChunkId: number;
    private _length: number;
    private _fast: boolean;
    private _smoothedFastValue: number;
    private _width: number;
    private _name?: string;
    private _paused: boolean = false;

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

        this._smoothedFastValue = dto.fast ? 1.0 : 0.0;

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
        for (const snakeChunk of this.chunks) {
            snakeChunk.predict();
        }

        // fix head chunk mesh
        if (this.headChunk) {
            this.headChunk.connectMeshToHead();
        }

        this.updateSmoothedFastValue();

        this.lastPredictionTime = FrameTime.now();
    }

    registerSnakeChunk(chunk: SnakeChunk): void {
        if (this.chunkIds.has(chunk.id)) {
            return;
        }

        this.chunkIds.add(chunk.id);

        if (chunk.id === this.headChunkId) {
            // As the latest chunk of the snake it should be the last element (rendering order)
            this.chunks.push(chunk);

            if (this.headChunk !== null) {
                // The mesh data of the head chunk will be changed so that
                // it is always connected to the (predicted) snake head.
                // These changes have to be reset when there is a new head chunk.
                this.headChunk.resetMesh();
            }
            this.headChunk = chunk;

            return;
        }

        if (this.chunks.length === 0) {
            // If this is the only chunk, order does not matter.
            this.chunks.push(chunk);
            return;
        }

        // This is an older chunk that the client did not yet know of. We have to find
        // the correct position for insertion into the array. The unique chunk id is
        // the combination of snake id and chunk id, here we only need the latter.
        // eslint-disable-next-line no-bitwise
        const offset = CHUNK_ID_MASK - (this.headChunkId & CHUNK_ID_MASK);
        const newChunkId = getComparableChunkId(chunk, offset);

        // TODO: use Array.prototype.findLastIndex when its available in all modern browsers
        let i = this.chunks.length - 1;
        for (; 0 <= i; i--) {
            const cId = getComparableChunkId(this.chunks[i], offset);
            if (cId < newChunkId) {
                // Insert the new chunk after this one.
                break;
            }
        }

        // If no chunk with a smaller id was found (i==-1) the new chunk will be inserted at index 0.
        this.chunks.splice(i + 1, 0, chunk);
    }

    unregisterSnakeChunk(chunk: SnakeChunk): void {
        const i = this.chunks.findIndex((c) => c === chunk);
        if (i < 0) {
            throw new Error(
                `Cannot unregister: Snake ${this.id} has no chunk with id ${chunk.id}.`
            );
        }
        this.chunkIds.delete(chunk.id);
        this.chunks.splice(i, 1);
    }

    /**
     * Intended for iterating over SnakeChunks. You may not remove
     * SnakeChunks during this iteration, that causes SnakeChunks
     * to be skipped.
     */
    getSnakeChunksIterator(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    hasChunks(): boolean {
        return this.chunks.length > 0;
    }

    toString(): string {
        return `Snake ${this.id} with ${this.chunks.length} chunks`;
    }

    /**
     * True if any of the snakes bounding boxes intersect with the viewport.
     * The snake could still be not visible though. If this method returns
     * false the snake cannot be visible.
     */
    couldBeVisible(camera: Camera, epsilon: number = 0.0): boolean {
        for (const chunk of this.chunks) {
            if (chunk.couldBeVisible(camera, epsilon)) {
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
        if (__DEBUG__ && !__TEST__ && !this._paused) {
            console.info(`Snake ${this.id} has been paused.`);
        }
        this._paused = true;
    }

    get name(): string | undefined {
        if (__DEBUG__) {
            return this._name ?? `Snake ${this.id}`;
        }

        return this._name;
    }

    get fast(): boolean {
        return this._fast;
    }

    /**
     * Returns 1.0 if the snake is fast and 0.0 if the snake is slow.
     * The value will not switch immediately but will be smoothly interpolated.
     */
    get smoothedFastValue(): number {
        return this._smoothedFastValue;
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

    private updateSmoothedFastValue() {
        const delta = (FrameTime.now() - this.lastPredictionTime) / 1000; // in seconds
        const targetValue = this.fast ? 1.0 : 0.0;
        const x = clamp(0.0, 5.0 * delta, 1.0);
        this._smoothedFastValue = x * targetValue + (1.0 - x) * this._smoothedFastValue;
    }

    /**
     * @param ticks server ticks since the last chun offset update
     * @param fastHistory snake speed for the last 8 ticks
     */
    private updateChunkOffsets(ticks: number, fastHistory: boolean[]) {
        if (ticks === 0) {
            // No server time has passed since the last update.
            return;
        }

        const fastSpeed = this.gameConfig.snakes.fastSpeed;
        const slowSpeed = this.gameConfig.snakes.speed;

        // The offset of the snake chunks changes based on the distance the
        // snake has travelled since the last update.
        let distance = 0.0;
        const N = Math.min(ticks, fastHistory.length);
        for (let i = 0; i < N; i++) {
            distance += fastHistory[i] ? fastSpeed : slowSpeed;
        }

        // We have no more speed data at this point so for all previous ticks
        // we assume slow speed. In practice this should never happen as the
        // server update rate should be close to the server tick rate.
        for (let i = N; i < ticks; i++) {
            distance += slowSpeed;
        }

        for (const chunk of this.chunks) {
            if (chunk.id === this.headChunkId) {
                // After an update the head chunk offset is always 0.
                continue;
            }

            chunk.updateOffset(distance);
        }
    }
}

function getComparableChunkId(chunk: SnakeChunk, offset: number): number {
    // eslint-disable-next-line no-bitwise
    return ((chunk.id & CHUNK_ID_MASK) + offset) & CHUNK_ID_MASK;
}
