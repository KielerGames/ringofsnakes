import Vector from "../math/Vector";
import { TickDataUpdate } from "../worker/TickDataUpdate";
import Snake from "./Snake";
import SnakeChunk from "./SnakeChunk";

export default class GameData {
    private snakes: Map<number, Snake> = new Map();
    private chunks: Map<number, SnakeChunk> = new Map();
    public cameraPosition: Vector = new Vector(0, 0);

    public update(data: TickDataUpdate): void {
        this.cameraPosition.set(data.cameraPosition);

        // update & add new snakes
        data.snakes.forEach((snakeData) => {
            const snake = this.snakes.get(snakeData.id);
            if (snake) {
                snake.update(snakeData);
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

        // update existing chunks
        // data.chunkOffsets.forEach((offset, chunkId) => {
        //     this.chunks.get(chunkId)!.updateOffset(offset);
        // });
        // TODO

        this.garbageCollectChunks();
    }

    public getChunks(): IterableIterator<SnakeChunk> {
        return this.chunks.values();
    }

    private garbageCollectChunks(): void {
        let deleteChunks: SnakeChunk[] = [];

        this.chunks.forEach((chunk) => {
            if (chunk.offset() >= chunk.snake.length) {
                deleteChunks.push(chunk);
            }
        });

        deleteChunks.forEach((chunk) => {
            this.chunks.delete(chunk.id);
            chunk.snake.removeChunk(chunk.id);
        });

        if (deleteChunks.length > 0) {
            console.log(`Garbage-collected ${deleteChunks.length} chunk(s).`);
        }
    }
}
