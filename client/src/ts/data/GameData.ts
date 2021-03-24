import { GameConfig } from "../protocol/client-server";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

type ChunkConsumer = (chunk: SnakeChunk) => any;

export default class GameData {
    private gameConfig: GameConfig; //TODO
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    public targetSnake: Snake;

    public update(data: GameUpdateData): void {
        this.gameConfig = data.gameConfig;

        // update snakes
        data.snakeInfos.forEach((snakeInfo) => {
            const snake = this.snakes.get(snakeInfo.snakeId);
            if (snake) {
                snake.update(snakeInfo, this.gameConfig);
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
            snake.addChunk(chunk);
            this.chunks.set(chunk.id, chunk);
        });

        this.garbageCollectChunks();
    }

    public forEachChunk(consumer: ChunkConsumer): void {
        this.chunks.forEach(consumer);
    }

    private garbageCollectChunks():void {
        let deleteChunks:SnakeChunk[] = [];

        this.chunks.forEach(chunk => {
            if(chunk.lastOffset >= chunk.snake.length) {
                deleteChunks.push(chunk);
            }
        });

        deleteChunks.forEach(chunk => {
            this.chunks.delete(chunk.id);
            chunk.snake.removeChunk(chunk.id);
        });

        if(deleteChunks.length > 0) {
            console.log(`Garbage-collected ${deleteChunks.length} chunk(s).`);
        }
    }
}
