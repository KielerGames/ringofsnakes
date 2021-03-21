import SnakeChunk from "./SnakeChunk";

export default class Snake {
    public readonly id: number;
    private chunks: Map<number, SnakeChunk> = new Map();

    public constructor(data: any) {}

    public get fast(): boolean {
        return false;
    }
}
