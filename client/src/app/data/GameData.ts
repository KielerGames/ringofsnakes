import { GameDataUpdate } from "../worker/GameDataUpdate";
import FoodChunk from "./FoodChunk";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

export default class GameData {
    private snakes: Map<number, Snake> = new Map();
    private snakeChunks: Map<number, SnakeChunk> = new Map();
    private foodChunks: Map<number, FoodChunk> = new Map();
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

        // add new snake chunks
        data.newSnakeChunks.forEach((chunkData) => {
            const snake = this.snakes.get(chunkData.snakeId);
            if (snake === undefined) {
                throw new Error(`No data for snake ${chunkData.snakeId}!`);
            }
            const chunk = new SnakeChunk(snake, chunkData);
            snake.setChunk(chunk);
            this.snakeChunks.set(chunk.id, chunk);
        });

        // update food chunks
        data.foodChunks.forEach((chunkDTO) =>
            this.foodChunks.set(chunkDTO.id, new FoodChunk(chunkDTO))
        );

        this.garbageCollectSnakeChunks();
    }

    public getSnakeChunks(): IterableIterator<SnakeChunk> {
        return this.snakeChunks.values();
    }

    public getFoodChunks(): IterableIterator<FoodChunk> {
        return this.foodChunks.values();
    }

    public getSnakes(): IterableIterator<Snake> {
        return this.snakes.values();
    }

    private garbageCollectSnakeChunks(): void {
        let deleteChunks: SnakeChunk[] = [];

        // collect "garbage" snake chunks
        this.snakeChunks.forEach((chunk) => {
            if (chunk.offset() >= chunk.snake.length) {
                deleteChunks.push(chunk);
            }
        });

        // remove collected chunks
        deleteChunks.forEach((chunk) => {
            this.snakeChunks.delete(chunk.id);
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
        this.snakes.forEach((snake) => {
            const currentChunk = snake.getCurrentChunk();

            if (currentChunk) {
                const pos = snake.getPredictedPosition(timeSinceLastTick);
                currentChunk.updateEndPoint(pos);
            }
        });
    }

    public get cameraTarget(): Snake | undefined {
        if (this.cameraTargetId >= 0) {
            return this.snakes.get(this.cameraTargetId);
        }
    }
}
