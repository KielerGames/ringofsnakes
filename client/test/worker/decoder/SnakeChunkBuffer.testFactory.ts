import Rand from "rand-seed";
import * as SCD from "../../../src/app/worker/decoder/SnakeChunkDecoder";

export function createSnakeChunkBuffer(
    numberOfChainCodes: number,
    init = { x: 0, y: 0, alpha: 0, id: 1 },
    random: Rand | null = new Rand("a random seed")
): ArrayBuffer {
    const data = new Uint8Array(
        SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes
    );
    data[4] = numberOfChainCodes;

    const view = new DataView(data.buffer, 0);
    view.setFloat32(9, init.x, false);
    view.setFloat32(13, init.y, false);
    view.setFloat32(5, init.alpha, false);
    view.setUint16(0, init.id, false);

    if (random) {
        const offset = SCD.SNAKE_CHUNK_HEADER_SIZE;

        for (let i = 0; i < numberOfChainCodes; i++) {
            data[offset + i] = Math.floor(random.next() * 256);
        }
    }

    return data.buffer;
}