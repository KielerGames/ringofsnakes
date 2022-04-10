import Game from "../../src/app/data/Game";
import RemoteMock from "../worker/worker.mock";
import { createSingleSnakeDataUpdate, emptyDataUpdate } from "./dto/DataUpdateDTO.prefab";
import * as UserInput from "../../src/app/input/UserInput";
import { DataUpdateDTO } from "../../src/app/data/dto/DataUpdateDTO";
import * as FrameTime from "../../src/app/util/FrameTime";

jest.mock("../../src/app/worker/WorkerFactory", () => ({
    default: () => RemoteMock
}));

jest.mock("../../src/app/data/config/ClientConfig", () => ({
    get: () => ({})
}));

jest.mock("comlink", () => ({
    proxy: (callback: () => void) => callback
}));

async function updateGame(game: Game, dto: DataUpdateDTO): Promise<void> {
    const mock = RemoteMock.addEventListener.mock;
    expect(mock.calls[0][0]).toBe("server-update");
    const serverUpdateNotifier = mock.calls[0][1];
    serverUpdateNotifier();
    RemoteMock.getDataChanges.mockReturnValueOnce(dto);
    await game.update();
}

describe("Game", () => {
    beforeEach(() => {
        FrameTime.update(0.0);
    });

    afterEach(() => {
        UserInput.removeAllListeners();
    });

    test("instantiation", async () => {
        await Game.joinAsPlayer("TestPlayer");
    });

    it("should only update after notification", async () => {
        const [game] = await Game.joinAsPlayer("TestPlayer");

        // without an update notification game.update should not do anything
        await game.update();
        expect(RemoteMock.getDataChanges).not.toHaveBeenCalled();

        await updateGame(game, emptyDataUpdate);
        expect(RemoteMock.getDataChanges).toHaveBeenCalledTimes(1);
    });

    test("an empty update should not pause snakes", async () => {
        const [game] = await Game.joinAsPlayer("TestPlayer");
        const snakeId = 1;
        await updateGame(game, createSingleSnakeDataUpdate(snakeId));
        const snake = game.snakes.get(snakeId)!;
        expect(snake.speed).toBeGreaterThan(0.0);
        await updateGame(game, emptyDataUpdate);
        expect(snake.speed).toBeGreaterThan(0.0);
    });

    describe("Prediction", () => {
        const snakeId = 1;
        test("SnakeChunks should be predicted once", async () => {
            const [game] = await Game.joinAsPlayer("TestPlayer");
            await updateGame(game, createSingleSnakeDataUpdate(snakeId, 1, 0));

            const spies = Array.from(game.snakeChunks.values()).map((chunk) =>
                jest.spyOn(chunk, "predict")
            );

            FrameTime.update(1000);
            game.predict();

            for (const spy of spies) {
                expect(spy).toBeCalledTimes(1);
            }
        });

        test("Snakes should be predicted once", async () => {
            const [game] = await Game.joinAsPlayer("TestPlayer");
            await updateGame(game, createSingleSnakeDataUpdate(snakeId, 1, 0));

            const spies = Array.from(game.snakes.values()).map((snake) =>
                jest.spyOn(snake, "predict")
            );

            FrameTime.update(1000);
            game.predict();

            for (const spy of spies) {
                expect(spy).toBeCalledTimes(1);
            }
        });
    });
});
