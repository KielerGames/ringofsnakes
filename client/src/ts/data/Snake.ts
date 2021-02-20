import { SnakeChunkData, SnakeInfo } from "../protocol/main-worker";

export class Snake {
    public data: SnakeInfo;
    public chunks: Map<number, SnakeChunk> = new Map();

    public constructor(info: SnakeInfo) {
        this.data = info;
    }

    public update(newInfo: SnakeInfo): void {
        this.data = newInfo;
        
        this.chunks.forEach((chunk) => {
            if (chunk.data.full) {
                chunk.data.offset += newInfo.fast ? 0.25 : 0.2; // TODO
            }
        });
    }

    public get id(): number {
        return this.data.snakeId;
    }
}

export class SnakeChunk {
    public readonly snake: Snake;
    public data: SnakeChunkData;

    public constructor(snake: Snake, chunkData: SnakeChunkData) {
        this.snake = snake;
        this.data = chunkData;
    }

    public get id(): number {
        return this.data.chunkId;
    }

    public getUniqueId(): number {
        return (this.snake.id << 16) + this.id;
    }
}
