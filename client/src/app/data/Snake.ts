import PredictedAngle from "../math/PredictedAngle";
import Vector from "../math/Vector";
import { SnakeData } from "../worker/GameDataUpdate";
import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    public readonly skin: number;
    private chunks: Map<number, SnakeChunk> = new Map();
    public length: number;
    private lastPosition: Vector;
    public speed: number;
    public direction: PredictedAngle;
    private currentChunk: SnakeChunk | null = null;

    public constructor(data: SnakeData) {
        this.id = data.id;
        this.skin = data.skin;
        this.length = data.length;
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

    public get width(): number {
        const MIN_WIDTH = 0.5;
        const MAX_WIDTH_GAIN = 4.0;
        const LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 700.0;
        const denominator = 1.0 / LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH;

        //TODO: get this value from the game config
        const minLength = 3.0;

        const x = 3.0 * (this.length - minLength) * denominator;
        const sigmoid = 1.0 / (1.0 + Math.exp(-x)) - 0.5;
        return 2.0 * (MIN_WIDTH + sigmoid * MAX_WIDTH_GAIN);
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
