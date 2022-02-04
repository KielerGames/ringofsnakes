jest.mock("../../../src/app/data/snake/Snake");
import Snake from "../../../src/app/data/snake/Snake";

const SnakeMock = jest.mocked(Snake);

export default SnakeMock;

export function createSnakeMock(id: number = 1): jest.Mocked<Snake> {
    //@ts-ignore
    const snake = new SnakeMock();

    Object.defineProperty(snake, "id", { value: id });

    return snake;
}
