import { assert } from "chai";

import * as SCD from "../app/worker/decoder/SnakeChunkDecoder";
import { GameConfig } from "../app/protocol";


const cfg: GameConfig = {
    snakeSpeed: 0.2,
    fastSnakeSpeed: 0.4,
    maxTurnDelta: 0.1,
    tickDuration: 1000/20
};

describe("SnakeChunkDecoder", () => {
    it("should accept valid buffers", () => {
        assert.doesNotThrow(() => {
            const numberOfChainCodes = 1;
            const data = new Uint8Array(SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes);
            data[4] = numberOfChainCodes;
            SCD.decode(data.buffer, 0, cfg);
        });
    });

    it("should reject buffers that are too small", () => {
        assert.throws(() => {
            const buffer = new Uint8Array(1).buffer;
            SCD.decode(buffer, 0, cfg);
        }, RangeError);

        assert.throws(() => {
            const numberOfChainCodes = 2;
            // create a buffer that is too small...
            const data = new Uint8Array(SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes - 1);
            data[4] = numberOfChainCodes;
            SCD.decode(data.buffer, 0, cfg);
        }, RangeError);
    });
});