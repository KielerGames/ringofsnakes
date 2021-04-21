import Rectangle from "../math/Rectangle";
import { GameConfig } from "../protocol";
import assert from "../utilities/assert";
import { SnakeChunkData } from "../worker/GameDataUpdate";
import Snake from "./Snake";

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

    public updateOffset(newOffset: number): void {
        this.lastTickOffset = newOffset;
    }

    public offset(timeSinceLastTick: number = 0.0): number {
        const t = timeSinceLastTick;
        assert(t >= 0.0);
        return this.lastTickOffset + t * this.snake.speed;
    }
}
