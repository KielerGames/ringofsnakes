import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    public readonly skin: number;
    private chunks: Map<number, SnakeChunk> = new Map();
    public length: number;

    public constructor(data: any) {}

    public get fast(): boolean {
        return false;
    }

    public get width(): number {
        return 0.5;
    }
}
