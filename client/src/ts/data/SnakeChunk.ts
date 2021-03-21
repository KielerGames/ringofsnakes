import Rectangle from "../math/Rectangle";
import { GameConfig } from "../protocol/client-server";
import { SnakeChunkData } from "../protocol/main-worker";
import assert from "../utilities/assert";
import Snake from "./Snake";

export default class SnakeChunk {
    public readonly id: number;
    public readonly snake: Snake;

    public readonly buffer: ArrayBuffer;
    public readonly vertices: number;
    private _offset: number;
    private _lastOffset: number;
    private time: number;
    private slowTicks: number = 0;
    private fastTicks: number = 0;

    private boundingBox: Rectangle;

    public constructor(snake: Snake, data: SnakeChunkData) {
        this.id = data.id;
        this.snake = snake;
        this._offset = data.offset;
        this.boundingBox = Rectangle.fromTransferable(data.boundingBox);
        this.buffer = data.buffer;
        this.vertices = data.vertices;
    }

    public computeOffset(config: GameConfig, time: number): number {
        const deltaTime = time - this.time;
        assert(deltaTime >= 0.0);
        const dtk = this.slowTicks + this.fastTicks;
        assert(dtk <= deltaTime);
        const remainingTime = deltaTime - dtk;

        const remainingOffset =
            (this.snake.fast ? config.fastSnakeSpeed : config.snakeSpeed) *
            remainingTime;
        this._lastOffset =
            this.slowTicks * config.snakeSpeed +
            this.fastTicks * config.fastSnakeSpeed +
            remainingOffset;
        return this._lastOffset;
    }

    public get lastOffset(): number {
        return this._lastOffset;
    }
}
