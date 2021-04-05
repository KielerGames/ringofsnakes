import { GameConfig } from "../../protocol";
import * as SID from "./SnakeInfoDecoder";
import * as SCD from "./SnakeChunkDecoder";

const UPDATE_HEADER_SIZE = 2;

export function decode(
    config: GameConfig,
    buffer: ArrayBuffer
): GameUpdateData {
    const view = new DataView(buffer);

    // read update header
    const numSnakeInfos = view.getUint8(0);
    const numSnakeChunks = view.getUint8(1);

    // read snake infos
    let byteOffset = UPDATE_HEADER_SIZE;
    const snakeInfos = new Array(numSnakeInfos);
    for(let i=0; i<numSnakeInfos; i++) {
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

    if (byteOffset !== buffer.byteLength) {
        console.warn(
            `Unexpected update buffer size (expected ${byteOffset}, was ${buffer.byteLength})`
        );
    }

    return {
        snakeInfos,
        chunkData: chunks
    };
}

export type GameUpdateData = {
    snakeInfos: SID.SnakeInfo[];
    chunkData: SCD.DecodedSnakeChunk[];
};
