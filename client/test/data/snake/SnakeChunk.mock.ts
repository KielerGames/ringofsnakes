jest.mock("../../../src/app/data/snake/SnakeChunk");
import Snake from "../../../src/app/data/snake/Snake";
import SnakeChunk from "../../../src/app/data/snake/SnakeChunk";

const SnakeChunkMock = jest.mocked(SnakeChunk);

export default SnakeChunkMock;

export function createSnakeChunkMock(snake?: Snake): jest.Mocked<SnakeChunk> {
    //@ts-ignore
    const chunk = new SnakeChunkMock();

    if (snake) {
        snake.registerSnakeChunk(chunk);
    }

    return chunk;
}
