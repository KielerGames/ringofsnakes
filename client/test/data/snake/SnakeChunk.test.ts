import { createSnakeMock } from "./Snake.mock";
import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import * as FrameTime from "../../../src/app/util/FrameTime";
import { createSnakeChunkDTO } from "../dto/SnakeChunkDTO.prefab";
import Snake from "../../../src/app/data/snake/Snake";

describe("SnakeChunk", () => {
    beforeEach(() => {
        FrameTime.update(0);
    });

    test("registration", () => {
        const snake = createSnakeMock();
        const chunk = createSnakeChunkForSnake(snake);

        expect(snake.registerSnakeChunk).toHaveBeenCalledTimes(1);
        expect(snake.unregisterSnakeChunk).not.toHaveBeenCalled();

        chunk.destroy();

        expect(snake.registerSnakeChunk).toHaveBeenCalledTimes(1);
        expect(snake.unregisterSnakeChunk).toHaveBeenCalledTimes(1);
    });

    describe("offset prediction", () => {
        const snake = createSnakeMock();

        const snakeSpeedMock = jest.fn();
        Object.defineProperty(snake, "speed", { get: snakeSpeedMock });

        const snakeLengthMock = jest.fn();
        Object.defineProperty(snake, "length", { get: snakeLengthMock });

        test("with constant speed", () => {
            snakeSpeedMock.mockReturnValue(1.0);
            const chunk = createSnakeChunkForSnake(snake);

            for (let d = 0; d < 42; d++) {
                FrameTime.update(d * 1000);
                chunk.predict();
                expect(chunk.offset).toBeCloseTo(d, 6);
            }

            expect(snakeSpeedMock).toBeCalled();
        });

        test("approximates correct value over time", () => {
            snakeSpeedMock.mockReturnValue(1.0);
            const chunk = createSnakeChunkForSnake(snake, true);

            FrameTime.update(1000);
            chunk.predict();

            const change = 42;

            let correctOffset = chunk.offset + change;
            FrameTime.update(2000);
            chunk.updateOffset(change);
            chunk.predict();
            let lastError = Math.abs(correctOffset - chunk.offset);

            for (let i = 1; i < 32; i++) {
                correctOffset += 1.0;
                FrameTime.update(3000 + i * 1000);
                chunk.predict();
                const error = Math.abs(correctOffset - chunk.offset);
                expect(error).toBeLessThan(lastError);
                lastError = error;
            }
        });

        test("does not change chunk junk state", () => {
            snakeSpeedMock.mockReturnValue(1.0);
            snakeSpeedMock.mockReturnValue(4.2);
            const chunk = createSnakeChunkForSnake(snake, true);
            expect(chunk.junk).toBe(false);
            for (let i = 1; i < 100; i++) {
                FrameTime.update(i * 1000);
                chunk.predict();
                expect(chunk.junk).toBe(false);
            }
            chunk.updateOffset(13);
            expect(chunk.junk).toBe(true);
        });
    });
});

function createSnakeChunkForSnake(
    snake: Snake,
    final: boolean = false
): SnakeChunk {
    return new SnakeChunk(
        snake,
        createSnakeChunkDTO({ snakeId: snake.id, full: final })
    );
}
