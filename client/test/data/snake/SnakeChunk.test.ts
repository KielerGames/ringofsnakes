import Snake from "../../../src/app/data/snake/Snake";
import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";
import Rectangle from "../../../src/app/math/Rectangle";
import Vector from "../../../src/app/math/Vector";
import { defaultConfig } from "../config/GameConfig.helper";
jest.mock("../../../src/app/data/snake/Snake");

beforeEach(() => {
    //@ts-ignore
    Snake.mockClear();
});

test("SnakeChunk registers itself", () => {
    const snake = new Snake(
        {
            id: 1,
            length: 8,
            width: 2,
            skin: 0,
            headPosition: { x: 0, y: 0 },
            headDirection: [0.0, 0.0], // [current direction, target direction]
            fast: false,
            fastHistory: [
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false
            ],
            headChunkId: 0
        },
        defaultConfig
    );
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
