jest.mock("../../../src/app/data/snake/Snake");
import Snake from "../../../src/app/data/snake/Snake";

import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import Rectangle from "../../../src/app/math/Rectangle";
import Vector from "../../../src/app/math/Vector";
import defaultConfig from "../config/GameConfig.prefab";
import snakeDTO from "../dto/SnakeDTO.prefab";

beforeEach(() => {
    //@ts-ignore
    Snake.mockClear();
});

test("SnakeChunk registers itself", () => {
    const snake = new Snake(snakeDTO, defaultConfig) as jest.Mocked<Snake>;

    const chunk = new SnakeChunk(snake, {
        id: 0,
        snakeId: snake.id,

        data: new Float32Array(0),
        vertices: 0,
        boundingBox: Rectangle.createAt(new Vector(0, 0), 4, 4), // ignores the snake width

        length: 4,
        offset: 0,
        full: false
    });
    expect(snake.registerSnakeChunk).toHaveBeenCalledTimes(1);
});
