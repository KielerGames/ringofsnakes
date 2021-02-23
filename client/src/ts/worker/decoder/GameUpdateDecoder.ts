import { GameConfig } from "../../protocol/client-server";
import * as SID from "./SnakeInfoDecoder";
import * as SCD from "./SnakeChunkDecoder";
import { GameUpdateData } from "../../protocol/main-worker";

const UPDATE_HEADER_SIZE = 2;

export function decode(
    targetSnakeId: number,
    config: GameConfig,
    buffer: ArrayBuffer
): GameUpdateData {
    const view = new DataView(buffer);

    const numSnakeInfos = view.getUint8(0);
    const numSnakeChunks = view.getUint8(1);

    const snakes = SID.decodeN(numSnakeInfos, buffer, UPDATE_HEADER_SIZE);

    const chunks = SCD.decodeN(
        numSnakeChunks,
        config,
        buffer,
        UPDATE_HEADER_SIZE + numSnakeInfos * SID.SNAKE_INFO_SIZE
    );

    return {
        snakeInfos: snakes,
        chunkData: chunks,
        targetSnakeId,
        gameConfig: config,
    };
}
