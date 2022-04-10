import defaultConfig from "../config/GameConfig.prefab";
import Snake from "../../../src/app/data/snake/Snake";
import snakeDTO, { createSnakeDTO } from "../dto/SnakeDTO.prefab";
import * as FrameTime from "../../../src/app/util/FrameTime";
import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import { createSnakeChunkDTO } from "../dto/SnakeChunkDTO.prefab";

describe("Snake", () => {
    beforeEach(() => {
        FrameTime.update(0);
    });

    test("snake updates snake chunks", () => {
        const snake = new Snake(snakeDTO, defaultConfig);
        const chunk = new SnakeChunk(
            snake,
            createSnakeChunkDTO({ snakeId: snake.id, id: 42, full: true })
        );

        const updateOffsetSpy = jest.spyOn(chunk, "updateOffset");
        expect(updateOffsetSpy).not.toHaveBeenCalled();

        snake.update(createSnakeDTO({ id: snake.id }), 1);
        expect(updateOffsetSpy).toHaveBeenCalledTimes(1);
    });

    test("a paused snake should not move", () => {
        const snake = new Snake(snakeDTO, defaultConfig);
        expect(snake.speed).toBeGreaterThan(0.0);
        snake.pause();
        expect(snake.speed).toBe(0.0);
    });

    test("server update should un-pause snake", () => {
        const snake = new Snake(snakeDTO, defaultConfig);
        snake.pause();
        snake.update(createSnakeDTO({ id: snake.id }), 1);
        expect(snake.speed).toBeGreaterThan(0.0);
    });
});
