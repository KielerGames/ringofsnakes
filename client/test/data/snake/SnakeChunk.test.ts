jest.mock("../../../src/app/data/snake/Snake");
import SnakeMock from "../../../src/app/data/snake/Snake";

import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import defaultConfig from "../config/GameConfig.prefab";
import snakeDTO from "../dto/SnakeDTO.prefab";
import * as FrameTime from "../../../src/app/util/FrameTime";
import { createSnakeChunkDTO } from "../dto/SnakeChunkDTO.prefab";

describe("SnakeChunk", () => {
    beforeEach(() => {
        FrameTime.update(0);
        jest.mocked(SnakeMock).mockClear();
    });

    test("registration", () => {
        const snake = new SnakeMock(snakeDTO, defaultConfig);
        const chunk = createSnakeChunkForSnake(snake);

        expect(snake.registerSnakeChunk).toHaveBeenCalledTimes(1);
        expect(snake.unregisterSnakeChunk).not.toHaveBeenCalled();

        chunk.destroy();

        expect(snake.registerSnakeChunk).toHaveBeenCalledTimes(1);
        expect(snake.unregisterSnakeChunk).toHaveBeenCalledTimes(1);
    });

    describe("offset prediction", () => {
        test("changes over time", () => {
            const snake = new SnakeMock(snakeDTO, defaultConfig);
            const chunk = createSnakeChunkForSnake(snake);

            // mock snake.speed
            const speedMock = jest.fn();
            Object.defineProperty(snake, "speed", { get: speedMock });
            speedMock.mockReturnValue(1.0);

            for (let d = 0; d < 42; d++) {
                FrameTime.update(d * 1000);
                chunk.predict();
                expect(chunk.offset).toBeCloseTo(d, 6);
            }

            expect(speedMock).toBeCalled();
        });
    });
});

function createSnakeChunkForSnake(snake: SnakeMock): SnakeChunk {
    return new SnakeChunk(snake, createSnakeChunkDTO({ snakeId: snake.id }));
}
