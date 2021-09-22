import PredictedAngle from "../math/PredictedAngle";
import Vector from "../math/Vector";
import { SnakeData } from "../worker/GameDataUpdate";
import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    public readonly skin: number;
    private chunks: Map<number, SnakeChunk> = new Map();
    public length: number;
    public width: number;
    private lastPosition: Vector;
    public speed: number;
    public direction: PredictedAngle;
    private currentChunk: SnakeChunk | null = null;

    public constructor(data: SnakeData) {
        this.id = data.id;
        this.skin = data.skin;
        this.length = data.length;
        this.width = data.width;
        this.lastPosition = Vector.fromObject(data.position);
        this.speed = data.speed;
        this.direction = new PredictedAngle(data.direction);
    }

    public update(
        data: SnakeData,
        ticksSinceLastUpdate: number,
        time: number
    ): void {
        this.length = data.length;
        this.width = data.width;
        this.lastPosition.set(data.position);
        this.direction.update(data.direction, data.targetDirection, time);

        if (ticksSinceLastUpdate > 0) {
            // update chunk offsets
            const diff =
                ticksSinceLastUpdate * this.speed + data.offsetCorrection;
            this.chunks.forEach((chunk) => chunk.addToOffset(diff));
        }

        this.speed = data.speed;
    }

    public getPredictedPosition(timeSinceLastTick: number): Vector {
        const pos = this.lastPosition.clone();
        pos.addPolar(this.direction.predict(0), timeSinceLastTick * this.speed);
        return pos;
    }

    public addSnakeChunk(chunk: SnakeChunk): void {
        this.chunks.set(chunk.id, chunk);

        if (!chunk.final) {
            this.currentChunk = chunk;
        } else if (this.currentChunk) {
            if (this.currentChunk.id === chunk.id) {
                this.currentChunk = null;
            }
        }
    }

    public removeSnakeChunk(id: number): void {
        this.chunks.delete(id);

        if (this.currentChunk && this.currentChunk.id === id) {
            if (__DEBUG__) {
                console.warn(
                    `Warning: Current chunk ${id} of snake ${this.currentChunk.snake.id} removed.`
                );
            }
            this.currentChunk = null;
        }
    }

    public getCurrentChunk(): SnakeChunk | null {
        return this.currentChunk;
    }

    public getSnakeChunks(): SnakeChunk[] {
        return Array.from(this.chunks.values());
    }
}
