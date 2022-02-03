jest.mock("../../../src/app/data/snake/SnakeChunk");
import SnakeChunkMock from "../../../src/app/data/snake/SnakeChunk";

import defaultConfig from "../config/GameConfig.prefab";
import Snake from "../../../src/app/data/snake/Snake";
import snakeDTO, { createSnakeDTO } from "../dto/SnakeDTO.prefab";
import * as FrameTime from "../../../src/app/util/FrameTime";

describe("Snake", () => {
    beforeEach(() => {
        FrameTime.update(0);
        jest.mocked(SnakeChunkMock).mockClear();
    });

    test("snake updates snake chunks", () => {
        const snake = new Snake(snakeDTO, defaultConfig);
        //@ts-ignore
        const chunk = new SnakeChunkMock();

        // the mock does not register itself
        snake.registerSnakeChunk(chunk);

        expect(chunk.updateOffset).not.toHaveBeenCalled();

        snake.update(createSnakeDTO({ id: snake.id }), 1);

        expect(chunk.updateOffset).toHaveBeenCalledTimes(1);
    });
});
