import { GameDataUpdate } from "../worker/GameDataUpdate";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

export default class GameData {
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    private cameraTargetId: number = -1;
    private lastUpdateTime: number = performance.now();

    public update(data: GameDataUpdate): void {
        // time stuff
        const now = performance.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // camera
        this.cameraTargetId = data.cameraTarget;

        // update & add new snakes
        data.snakes.forEach((snakeData) => {
            const snake = this.snakes.get(snakeData.id);
            if (snake) {
                snake.update(snakeData, data.ticksSinceLastUpdate, now);
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
            snake.setChunk(chunk);
            this.chunks.set(chunk.id, chunk);
        });

        this.garbageCollectChunks();
    }

    public getChunks(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    public getSnakes(): IterableIterator<Snake> {
        return this.snakes.values();
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

    /**
     * Computes time elapsed between now and the last update.
     * @param now timestamp in ms
     * @returns delta time in seconds
     */
    public timeSinceLastUpdate(now: number = performance.now()): number {
        return 0.001 * (now - this.lastUpdateTime);
    }

    public predict(timeSinceLastTick: number): void {
        this.snakes.forEach(snake => {
            const currentChunk = snake.getCurrentChunk();

            if(currentChunk) {
                const pos = snake.getPredictedPosition(timeSinceLastTick);
                currentChunk.updateEndPoint(pos);
            }
        });
    }

    public get cameraTarget(): Snake | undefined {
        if(this.cameraTargetId >= 0) {
            return this.snakes.get(this.cameraTargetId);
        }
    }
}
