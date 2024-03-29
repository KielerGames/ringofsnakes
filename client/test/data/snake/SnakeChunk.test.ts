import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import * as FrameTime from "../../../src/app/util/FrameTime";
import { createSnakeChunkDTO } from "../dto/SnakeChunkDTO.prefab";
import Snake from "../../../src/app/data/snake/Snake";
import { createSnakeDTO } from "../dto/SnakeDTO.prefab";
import defaultConfig, { zeroSpeedConfig } from "../config/GameConfig.prefab";
import { generateArray } from "../../../src/app/util/ArrayHelper";

describe("SnakeChunk", () => {
    beforeEach(() => {
        FrameTime.update(0);
    });

    test("registration", () => {
        const snake = new Snake(createSnakeDTO({}), defaultConfig);
        const registerSpy = jest.spyOn(snake, "registerSnakeChunk");
        const unregisterSpy = jest.spyOn(snake, "unregisterSnakeChunk");

        const chunk = createSnakeChunkForSnake(snake);

        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(unregisterSpy).not.toHaveBeenCalled();

        chunk.destroy();

        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(unregisterSpy).toHaveBeenCalledTimes(1);
    });

    describe("offset prediction", () => {
        let snake: Snake;
        const snakeSpeedMock = jest.fn();
        const snakeLengthMock = jest.fn();

        beforeEach(() => {
            snake = new Snake(createSnakeDTO({}), defaultConfig);
            Object.defineProperty(snake, "speed", { get: snakeSpeedMock });
            Object.defineProperty(snake, "length", { get: snakeLengthMock });
        });

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
            snakeLengthMock.mockReturnValue(4.2);
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

    describe("lifecycle", () => {
        it("should become junk eventually", () => {
            const snake = new Snake(createSnakeDTO({}), defaultConfig);
            expect(snake.length).not.toBe(undefined);
            const chunk = createSnakeChunkForSnake(snake, true);
            expect(chunk.junk).toBe(false);
            for (let i = 0; i < 100 && !chunk.junk; i++) {
                chunk.updateOffset(1);
            }
            expect(chunk.junk).toBe(true);
        });

        test("junk state should depend on snake length", () => {
            const length = 10;
            const snake = new Snake(createSnakeDTO({ length }), zeroSpeedConfig);
            const chunks = generateArray(
                length,
                (i) =>
                    new SnakeChunk(snake, createSnakeChunkDTO({ id: i + 1, offset: i, full: true }))
            );
            expect(snake.hasChunks()).toBe(true);
            chunks.forEach((chunk) => expect(chunk.junk).toBe(false));

            for (let i = 1; i <= length; i++) {
                snake.update(createSnakeDTO({ length: length - i }), 1);
                expect(snake.length).toBe(length - i);
                expect(chunks.filter((chunk) => chunk.junk).length).toBe(i);
            }
        });

        test("junk state should depend on offset", () => {
            const n = 10;
            const length = defaultConfig.snakes.speed * n;
            const snake = new Snake(createSnakeDTO({ length }), defaultConfig);
            const chunks = generateArray(
                n,
                (i) =>
                    new SnakeChunk(snake, createSnakeChunkDTO({ id: i + 1, offset: i, full: true }))
            );
            chunks.forEach((chunk) => expect(chunk.junk).toBe(false));

            for(let i=1; i<=n; i++) {
                snake.update(createSnakeDTO({length}), 1);
                expect(snake.length).toBe(length);
                expect(chunks.filter(chunk => chunk.junk).length).toBe(i);
            }
        });
    });
});

function createSnakeChunkForSnake(snake: Snake, final: boolean = false): SnakeChunk {
    return new SnakeChunk(snake, createSnakeChunkDTO({ snakeId: snake.id, full: final }));
}
