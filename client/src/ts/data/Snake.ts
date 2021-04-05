import Vector from "../math/Vector";
import { SnakeInfo } from "../worker/decoder/GameUpdateDecoder";
import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    public readonly skin: number;
    private chunks: Map<number, SnakeChunk> = new Map();
    public length: number;
    private position:Vector;

    public constructor(data: SnakeInfo) {
        this.id = data.snakeId;
        this.skin = data.skin;
        this.length = data.length;
        this.position = //new Vector(data.position.x)
    }

    public update(data: SnakeInfo): void {
        this.length = data.length;
        //TODO position
    }

    public get fast(): boolean {
        return false;
    }

    public get width(): number {
        return 0.5;
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }

    public addChunk(chunk: SnakeChunk):void {
        this.chunks.set(chunk.id, chunk);
    }

    public removeChunk(id: number):void {
        this.chunks.delete(id);
    }
}
