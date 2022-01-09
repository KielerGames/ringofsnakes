import Rectangle from "../math/Rectangle";
import { LeaderboardData } from "../protocol";
import { GameConfig } from "../types/GameConfig";
import { MainThreadGameDataUpdate } from "../worker/MainThreadGameDataUpdate";
import FoodChunk from "./FoodChunk";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

export default class GameData {
    private readonly snakes: Map<number, Snake> = new Map();
    private readonly snakeChunks: Map<number, SnakeChunk> = new Map();
    private readonly foodChunks: Map<number, FoodChunk> = new Map();
    private targetSnakeId: number = -1;
    private lastUpdateTime: number = performance.now();
    public readonly config: GameConfig;
    private leaderboardData: LeaderboardData;

    public constructor(config: GameConfig) {
        this.config = config;
    }

    public update(data: MainThreadGameDataUpdate): void {
        // time stuff
        const now = performance.now();
        //const timeSinceLastUpdate = now - this.lastUpdateTime;
        if (data.hasChanged) {
            this.lastUpdateTime = now;
        }

        // camera
        this.targetSnakeId = data.targetSnakeId;

        const localSnakeIds = new Set(this.snakes.keys());
        this.leaderboardData = data.leaderboardData;

        // update & add new snakes
        data.snakes.forEach((snakeData) => {
            const snake = this.snakes.get(snakeData.id);
            localSnakeIds.delete(snakeData.id);
            if (snake) {
                snake.update(
                    snakeData,
                    data.ticksSinceLastMainThreadUpdate,
                    now
                );
            } else {
                this.snakes.set(snakeData.id, new Snake(snakeData));
            }
        });

        // remove snakes
        localSnakeIds.forEach((snakeId) => {
            const snake = this.snakes.get(snakeId)!;
            snake
                .getSnakeChunks()
                .forEach((chunk) => this.snakeChunks.delete(chunk.id));
            this.snakes.delete(snakeId);
        });

        // add new snake chunks
        data.newSnakeChunks.forEach((chunkData) => {
            const snake = this.snakes.get(chunkData.snakeId);
            if (snake === undefined) {
                throw new Error(`No data for snake ${chunkData.snakeId}!`);
            }
            const chunk = new SnakeChunk(snake, chunkData);
            snake.addSnakeChunk(chunk);
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

    public getLeaderboardData(): LeaderboardData {
        return this.leaderboardData;
    }

    public garbageCollectFoodChunks(viewBox: Rectangle): void {
        Array.from(this.foodChunks.values())
            .filter((fc) => !fc.isVisible(viewBox))
            .forEach((fc) => {
                this.foodChunks.delete(fc.id);
                fc.destroy();
            });
    }

    private garbageCollectSnakeChunks(): void {
        const chunksToDelete: SnakeChunk[] = [];

        // collect "garbage" snake chunks
        this.snakeChunks.forEach((chunk) => {
            if (chunk.offset() >= chunk.snake.length) {
                chunksToDelete.push(chunk);
            }
        });

        // remove collected chunks
        chunksToDelete.forEach((chunk) => {
            this.snakeChunks.delete(chunk.id);
            chunk.snake.removeSnakeChunk(chunk.id);
        });

        if (chunksToDelete.length > 0) {
            console.log(`Garbage-collected ${chunksToDelete.length} chunk(s).`);
        }
    }

    /**
     * Computes time elapsed between now and the last update.
     * @param now timestamp in ms
     * @returns delta time in seconds
     */
    public timeSinceLastUpdate(now: number): number {
        return 0.001 * (now - this.lastUpdateTime);
    }

    public predict(secondsSinceLastTick: number): void {
        this.snakes.forEach((snake) => {
            const currentChunk = snake.getCurrentChunk();

            if (currentChunk) {
                const pos = snake.getPredictedPosition(secondsSinceLastTick);
                currentChunk.updateEndPoint(pos);
            }
        });
    }

    public get targetSnake(): Snake | undefined {
        if (this.targetSnakeId >= 0) {
            const snake = this.snakes.get(this.targetSnakeId);
            if (!snake) {
                throw new Error(
                    `Target snake ${this.targetSnakeId} does not exist.`
                );
            }
            return snake;
        }

        return undefined;
    }
}
