import SnakeChunkMock, { createSnakeChunkMock } from "./SnakeChunk.mock";
import defaultConfig from "../config/GameConfig.prefab";
import Snake from "../../../src/app/data/snake/Snake";
import snakeDTO, { createSnakeDTO } from "../dto/SnakeDTO.prefab";
import * as FrameTime from "../../../src/app/util/FrameTime";

describe("Snake", () => {
    beforeEach(() => {
        FrameTime.update(0);
        SnakeChunkMock.mockClear();
    });

    test("snake updates snake chunks", () => {
        const snake = new Snake(snakeDTO, defaultConfig);
        const chunk = createSnakeChunkMock(snake);

        expect(chunk.updateOffset).not.toHaveBeenCalled();

        snake.update(createSnakeDTO({ id: snake.id }), 1);

        expect(chunk.updateOffset).toHaveBeenCalledTimes(1);
    });
});
