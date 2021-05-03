import Rectangle from "../math/Rectangle";
import { GameConfig } from "../protocol";
import assert from "../utilities/assert";
import { SnakeChunkData } from "../worker/GameDataUpdate";
import Snake from "./Snake";

declare const __DEBUG__: boolean;
export default class SnakeChunk {
    public readonly id: number;
    public readonly snake: Snake;

    public readonly buffer: Float32Array;
    public readonly vertices: number;
    public readonly final: boolean;
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
    }

    public addToOffset(diff: number): void {
        if(__DEBUG__) {
            if(diff < 0) {
                console.warn(`Negative offset correction by ${diff}.`);
            }
            if(!this.final) {
                console.warn(`Offset change on non-final chunk`);
            }
        }
        this.lastTickOffset += diff;
    }

    public offset(timeSinceLastTick: number = 0.0): number {
        const t = timeSinceLastTick;
        assert(t >= 0.0);
        return this.lastTickOffset + t * this.snake.speed;
    }
}
