import { SnakeChunkDTO } from "../dto/SnakeChunkDTO";
import Snake from "./Snake";
import * as FrameTime from "../../util/FrameTime";
import assert from "../../util/assert";

/**
 * Main thread representation of a SnakeChunk.
 */
export default class SnakeChunk {
    readonly snake: Snake;
    readonly id: number;

    #final: boolean = false;

    // offset prediction
    #lastUpdateTime: number;
    #lastKnownOffset: number;
    #predictedOffset: number;

    constructor(snake: Snake, dto: SnakeChunkDTO) {
        this.snake = snake;
        this.id = dto.id;
        snake.registerSnakeChunk(this);

        this.update(dto);
    }

    update(dto: SnakeChunkDTO): void {
        assert(!this.#final);
        this.#final = dto.final;
        this.#lastUpdateTime = FrameTime.now();
        this.#lastKnownOffset = dto.offset;
    }

    updateOffset(fastBitHistory: boolean[]): void {

    }

    predict(): void {
        // TODO
    }
}
