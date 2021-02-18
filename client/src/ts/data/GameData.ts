import { GameUpdateData } from "../protocol/main-worker";
import { Snake, SnakeChunk } from "./Snake";

type ChunkConsumer = (chunk: SnakeChunk) => any;

export default class GameData {
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    public targetSnake: Snake;

    public update(data: GameUpdateData): void {
        // update snakes
        data.snakeInfos.forEach((snakeInfo) =>
            this.snakes.set(snakeInfo.snakeId, new Snake(snakeInfo))
        );
        this.targetSnake = this.snakes.get(data.targetSnakeId)!;

        // update chunks
        data.chunkData.forEach((chunkData) => {
            const snake = this.snakes.get(chunkData.snakeId);
            if (snake === undefined) {
                console.warn(`No data for snake ${chunkData.snakeId}!`);
                return;
            }
            const chunk = new SnakeChunk(snake, chunkData);
            snake.chunks.set(chunk.id, chunk);
            this.chunks.set(chunk.getUniqueId(), chunk);
        });
    }

    public forEachChunk(consumer: ChunkConsumer): void {
        this.chunks.forEach(consumer);
    }
}
