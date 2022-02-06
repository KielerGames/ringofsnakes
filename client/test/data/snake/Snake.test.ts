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
        const chunk = new SnakeChunk(snake, createSnakeChunkDTO({ snakeId: snake.id, id: 42, full: true }));

        const updateOffsetSpy = jest.spyOn(chunk, "updateOffset");

        expect(updateOffsetSpy).not.toHaveBeenCalled();

        snake.update(createSnakeDTO({ id: snake.id }), 1);

        expect(updateOffsetSpy).toHaveBeenCalledTimes(1);
    });
});
