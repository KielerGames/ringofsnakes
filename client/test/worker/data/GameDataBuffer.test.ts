import GameDataBuffer from "../../../src/app/worker/data/GameDataBuffer";
import { SpawnInfo } from "../../../src/app/worker/data/JSONMessages";
import defaultConfig from "../../data/config/GameConfig.prefab";
import { createSnakeChunkBuffer } from "../decoder/SnakeChunkBuffer.testFactory";
import { UPDATE_HEADER_SIZE } from "../../../src/app/worker/decoder/GameUpdateDecoder";
import { SNAKE_INFO_SIZE } from "../../../src/app/worker/decoder/SnakeInfoDecoder";

describe("GameDataBuffer", () => {
    test("empty buffer duration", () => {
        const buffer = new GameDataBuffer();
        const spawnInfo = createSpawnInfo(7);
        buffer.init(spawnInfo);

        expect(buffer.duration).toBe(0);
    });

    test("snakes should stay dead", () => {
        const buffer = new GameDataBuffer();
        const spawnInfo = createSpawnInfo(42);
        buffer.init(spawnInfo);

        const ccn = 20;

        for (let i = 0; i < 3; i++) {
            buffer.addBinaryUpdate(createGameUpdateBuffer(spawnInfo, ccn + i));
        }

        buffer.addJSONUpdate({
            tag: "SnakeDeathInfo",
            snakeId: spawnInfo.snakeId
        });

        let lastUpdate = buffer.nextUpdate();

        while (lastUpdate.snakeDeaths.length === 0 && lastUpdate.moreUpdates) {
            lastUpdate = buffer.nextUpdate();
        }

        expect(lastUpdate.snakeDeaths.length).toBe(1);

        // snake is now dead and should not receive anymore updates

        while (lastUpdate.moreUpdates) {
            lastUpdate = buffer.nextUpdate();
            const snakeChunkDTOs = lastUpdate.snakeChunks.filter(
                (sc) => sc.snakeId === spawnInfo.snakeId
            );
            expect(snakeChunkDTOs.length).toBe(0);
        }
    });

    test("update event trigger", () => {
        const eventCallback = jest.fn();
        const buffer = new GameDataBuffer(eventCallback);
        const spawnInfo = createSpawnInfo(127);
        buffer.init(spawnInfo);

        buffer.addJSONUpdate({
            tag: "SnakeNameUpdate",
            names: {
                "42": "ASnakeWithNoName"
            }
        });

        expect(eventCallback).not.toHaveBeenCalled();

        buffer.addJSONUpdate({
            tag: "SnakeDeathInfo",
            snakeId: 13
        });

        expect(eventCallback).toHaveBeenCalledTimes(1);

        buffer.addBinaryUpdate(createGameUpdateBuffer(spawnInfo, 16));

        expect(eventCallback).toHaveBeenCalledTimes(2);
    });
});

function createSpawnInfo(snakeId: number): SpawnInfo {
    return {
        tag: "SpawnInfo",
        snakeId,
        snakeName: "TestSnakeName",
        snakePosition: { x: 0, y: 0 },
        gameConfig: defaultConfig
    };
}

function createGameUpdateBuffer(spawnInfo: SpawnInfo, ccn: number): ArrayBuffer {
    const siArray = new Uint8Array(SNAKE_INFO_SIZE);
    const scBuffer = createSnakeChunkBuffer(
        ccn,
        { ...spawnInfo.snakePosition, alpha: 0, id: spawnInfo.snakeId },
        null
    );
    const guArray = new Uint8Array(UPDATE_HEADER_SIZE + siArray.byteLength + scBuffer.byteLength);

    guArray[0] = 1; // ticks since last update
    guArray[1] = 1; // number of snake infos
    guArray[2] = 1; // number of snake chunks

    // snake info
    const siDV = new DataView(siArray.buffer);
    siDV.setUint16(0, spawnInfo.snakeId, false);
    siDV.setFloat32(6, 4.2, false);

    // copy buffers
    guArray.set(siArray, UPDATE_HEADER_SIZE);
    guArray.set(new Uint8Array(scBuffer), UPDATE_HEADER_SIZE + siArray.byteLength);

    return guArray.buffer;
}
