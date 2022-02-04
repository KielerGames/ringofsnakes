import SnakeChunkMock from "./snake/SnakeChunk.mock";
import Game from "../../src/app/data/Game";
import RemoteMock, { clearDefaultRemoteMock } from "../worker/worker.mock";
import { emptyDataUpdate } from "./dto/DataUpdateDTO.prefab";
import * as UserInput from "../../src/app/input/UserInput";

jest.mock("../../src/app/worker/WorkerFactory", () => ({
    default: () => RemoteMock
}));

jest.mock("../../src/app/data/config/ClientConfig", () => ({
    get: () => ({})
}));

jest.mock("comlink", () => ({
    proxy: (callback: Function) => callback
}));

describe("Game", () => {
    beforeEach(() => {
        clearDefaultRemoteMock();
        SnakeChunkMock.mockClear();
    });

    afterEach(() => {
        UserInput.removeAllListeners();
    });

    test("instantiation", async () => {
        await Game.joinAsPlayer("TestPlayer");
    });

    describe("Updates", () => {
        it("should only update after notification", async () => {
            const [game] = await Game.joinAsPlayer("TestPlayer");

            expect(RemoteMock.addEventListener.mock.calls[0][0]).toBe(
                "server-update"
            );

            const serverUpdateNotifier =
                RemoteMock.addEventListener.mock.calls[0][1];

            // without an update notification game.update should not do anything
            await game.update();

            serverUpdateNotifier();
            expect(RemoteMock.getDataChanges).not.toHaveBeenCalled();

            RemoteMock.getDataChanges.mockReturnValue(
                Promise.resolve(emptyDataUpdate)
            );

            await game.update();
            expect(RemoteMock.getDataChanges).toHaveBeenCalledTimes(1);
        });
    });
});
