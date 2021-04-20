import Vector from "../math/Vector";
import { SnakeData } from "../worker/TickDataUpdate";
import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    public readonly skin: number;
    private chunks: Map<number, SnakeChunk> = new Map();
    public length: number;
    private position:Vector;
    public speed: number;

    public constructor(data: SnakeData) {
        this.id = data.id;
        this.skin = data.skin;
        this.length = data.length;
        this.position = Vector.fromObject(data.position);
        this.speed = data.speed;
    }

    public update(data: SnakeData): void {
        this.length = data.length;
        this.position.set(data.position);
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
