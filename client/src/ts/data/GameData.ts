import { GameConfig } from "../protocol/client-server";
import { GameUpdateData } from "../protocol/main-worker";
import { Snake, SnakeChunk } from "./Snake";

type ChunkConsumer = (chunk: SnakeChunk) => any;

export default class GameData {
    private gameConfig: GameConfig; //TODO
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    public targetSnake: Snake;

    public update(data: GameUpdateData): void {
        // update snakes
        data.snakeInfos.forEach((snakeInfo) => {
            const snake = this.snakes.get(snakeInfo.snakeId);
            if (snake) {
                snake.update(snakeInfo);
            } else {
                this.snakes.set(snakeInfo.snakeId, new Snake(snakeInfo));
            }
        });
        this.targetSnake = this.snakes.get(data.targetSnakeId)!;

        // update chunks
        data.chunkData.forEach((chunkData) => {
            const snake = this.snakes.get(chunkData.snakeId);
            if (snake === undefined) {
                throw new Error(`No data for snake ${chunkData.snakeId}!`);
            }
            const chunk = new SnakeChunk(snake, chunkData);
            snake.chunks.set(chunk.id, chunk);
            this.chunks.set(chunk.getUniqueId(), chunk);
        });

        this.garbageCollectChunks();
    }

    public forEachChunk(consumer: ChunkConsumer): void {
        this.chunks.forEach(consumer);
    }

    private garbageCollectChunks():void {
        let deleteChunks:SnakeChunk[] = [];

        this.chunks.forEach(chunk => {
            if(chunk.data.offset >= chunk.snake.data.length) {
                deleteChunks.push(chunk);
            }
        });

        deleteChunks.forEach(chunk => {
            this.chunks.delete(chunk.getUniqueId());
            chunk.snake.chunks.delete(chunk.id);
        });

        if(deleteChunks.length > 0) {
            console.log(`Garbage-collected ${deleteChunks.length} chunks.`);
        }
    }
}
