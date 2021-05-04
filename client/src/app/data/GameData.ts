import { GameDataUpdate } from "../worker/GameDataUpdate";
import Camera from "./Camera";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

export default class GameData {
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    public camera: Camera = new Camera(0.0, 0.0);
    private lastUpdateTime: number = performance.now();

    public update(data: GameDataUpdate): void {
        // time stuff
        const now = performance.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // camera
        this.camera.setTargetPosition(data.cameraPosition);

        // update & add new snakes
        data.snakes.forEach((snakeData) => {
            const snake = this.snakes.get(snakeData.id);
            if (snake) {
                snake.update(snakeData, data.ticksSinceLastUpdate);
            } else {
                this.snakes.set(snakeData.id, new Snake(snakeData));
            }
        });

        // add new chunks
        data.newChunks.forEach((chunkData) => {
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

    public getChunks(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    private garbageCollectChunks(): void {
        let deleteChunks: SnakeChunk[] = [];

        // collect "garbage" chunks
        this.chunks.forEach((chunk) => {
            if (chunk.offset() >= chunk.snake.length) {
                deleteChunks.push(chunk);
            }
        });

        // remove collected chunks
        deleteChunks.forEach((chunk) => {
            this.chunks.delete(chunk.id);
            chunk.snake.removeChunk(chunk.id);
        });

        if (deleteChunks.length > 0) {
            console.log(`Garbage-collected ${deleteChunks.length} chunk(s).`);
        }
    }

    public timeSinceLastUpdate(): number {
        return 0.001 * (performance.now() - this.lastUpdateTime);
    }
}
