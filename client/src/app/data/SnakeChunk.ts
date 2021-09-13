import Rectangle from "../math/Rectangle";
import Vector from "../math/Vector";
import { SnakeChunkData } from "../worker/GameDataUpdate";
import Snake from "./Snake";

export default class SnakeChunk {
    public readonly id: number;
    public readonly snake: Snake;

    public readonly buffer: Float32Array;
    public readonly vertices: number;
    public readonly final: boolean;
    public readonly length: number;
    private lastTickOffset: number;

    private boundingBox: Rectangle;

    public constructor(snake: Snake, data: SnakeChunkData) {
        this.id = data.id;
        this.snake = snake;
        this.lastTickOffset = data.offset;
        this.boundingBox = Rectangle.fromTransferable(data.boundingBox);
        this.buffer = data.data;
        this.vertices = data.vertices;
        this.final = data.final;
        this.length = data.length;
    }

    public addToOffset(diff: number): void {
        if (__DEBUG__) {
            if (diff < 0) {
                console.warn(`Negative offset correction by ${diff}.`);
            }
            if (!this.final) {
                console.warn(`Offset change on non-final chunk.`);
            }
        }
        this.lastTickOffset += diff;
    }

    /**
     * Offset is the path-distance from the snake head to this chunk.
     * @param timeSinceLastTick
     * @returns
     */
    public offset(timeSinceLastTick: number = 0.0): number {
        const t = timeSinceLastTick;
        return this.lastTickOffset + t * this.snake.speed;
    }

    public updateEndPoint(end: Vector): void {
        const n = this.buffer.length;
        if (n > 12) {
            this.buffer[n - 6] = end.x;
            this.buffer[n - 5] = end.y;
            this.buffer[n - 12] = end.x;
            this.buffer[n - 11] = end.y;
        }

        this.boundingBox = this.boundingBox.extendTo(
            end,
            0.5 * this.snake.width
        );
    }

    public getBoundingBox(): Rectangle {
        return this.boundingBox;
    }
}
