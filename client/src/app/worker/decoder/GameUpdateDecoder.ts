import * as SID from "./SnakeInfoDecoder";
import * as SCD from "./SnakeChunkDecoder";
import * as FCD from "./FoodDecoder";
import { GameConfig } from "../../types/GameConfig";

const UPDATE_HEADER_SIZE = 4;

export function decode(
    config: GameConfig,
    buffer: ArrayBuffer
): GameUpdateData {
    const view = new DataView(buffer);

    // read update header
    const ticksSinceLastUpdate = view.getUint8(0);
    const numSnakeInfos = view.getUint8(1);
    const numSnakeChunks = view.getUint8(2);
    const numFoodChunks = view.getUint8(3);

    let byteOffset = UPDATE_HEADER_SIZE;

    // read snake infos
    const snakeInfos = new Array(numSnakeInfos);
    for (let i = 0; i < numSnakeInfos; i++) {
        const result = SID.decode(buffer, byteOffset);
        snakeInfos[i] = result.data;
        byteOffset = result.nextByteOffset;
    }

    // read chunks
    const chunks: SCD.DecodedSnakeChunk[] = new Array(numSnakeChunks);
    for (let i = 0; i < numSnakeChunks; i++) {
        const result = SCD.decode(buffer, byteOffset, config);
        chunks[i] = result.data;
        byteOffset = result.nextByteOffset;
    }

    const foodChunks: FCD.FoodChunkDTO[] = new Array(numFoodChunks);
    for (let i = 0; i < numFoodChunks; i++) {
        const result = FCD.decode(buffer, byteOffset, config);
        foodChunks[i] = result.data;
        byteOffset = result.nextByteOffset;
    }

    if (byteOffset !== buffer.byteLength) {
        console.warn(
            `Unexpected update buffer size (expected ${byteOffset}, was ${buffer.byteLength})`
        );
    }

    return {
        ticksSinceLastUpdate,
        snakeInfos,
        snakeChunkData: chunks,
        foodChunkData: foodChunks
    };
}

export type GameUpdateData = {
    ticksSinceLastUpdate: number;
    snakeInfos: SID.SnakeInfo[];
    snakeChunkData: SCD.DecodedSnakeChunk[];
    foodChunkData: FCD.FoodChunkDTO[];
};
