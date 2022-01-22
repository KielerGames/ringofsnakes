import { SnakeChunkDTO } from "../dto/SnakeChunkDTO";
import Snake from "./Snake";

/**
 * Main thread representation of a SnakeChunk.
 */
export default class SnakeChunk {
    readonly snake: Snake;
    readonly id: number;

    constructor(snake: Snake, dto: SnakeChunkDTO) {
        this.snake = snake;
        this.id = dto.id;

        snake.registerSnakeChunk(this);
    }

    update(dto: SnakeChunkDTO): void {
        throw new Error("Method not implemented.");
    }
}
