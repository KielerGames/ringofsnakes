import { assert } from "chai";

import * as SCD from "../app/worker/decoder/SnakeChunkDecoder";
import { GameConfig } from "../app/protocol";

const cfg: GameConfig = {
    snakeSpeed: 0.24,
    fastSnakeSpeed: 0.48,
    maxTurnDelta: Math.PI / 30,
    tickDuration: 1.0 / 25,
};

function createSnakeChunkBuffer(numberOfChainCodes: number): ArrayBuffer {
    const data = new Uint8Array(
        SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes
    );
    data[4] = numberOfChainCodes;
    return data.buffer;
}

describe("SnakeChunkDecoder", () => {
    it("should accept valid buffers", () => {
        const buffer = createSnakeChunkBuffer(1);
        assert.doesNotThrow(() => SCD.decode(buffer, 0, cfg));
    });

    it("should reject buffers that are too small", () => {
        assert.throws(() => {
            const buffer = new Uint8Array(1).buffer;
            SCD.decode(buffer, 0, cfg);
        }, RangeError);

        assert.throws(() => {
            const numberOfChainCodes = 2;
            // create a buffer that is too small...
            const data = new Uint8Array(
                SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes - 1
            );
            data[4] = numberOfChainCodes;
            SCD.decode(data.buffer, 0, cfg);
        }, RangeError);

        assert.throws(() => {
            const buffer = createSnakeChunkBuffer(1);
            SCD.decode(buffer, 13, cfg);
        }, RangeError);
    });

    it("pathLength should behave linearly", () => {
        const buffer = createSnakeChunkBuffer(42);
        const pathLength = SCD.decode(buffer, 0, cfg).data.pathLength;
        assert.isAbove(pathLength, 0.0);

        const fasterCfg: GameConfig = Object.assign({}, cfg, { snakeSpeed: 4.2 * cfg.snakeSpeed });
        assert.approximately(SCD.decode(buffer, 0, fasterCfg).data.pathLength, 4.2 * pathLength, 1e-8);
    });

    it("pathData length component should increase monotonically", () => {
        const buffer = createSnakeChunkBuffer(42);
        const pathData = SCD.decode(buffer, 0, cfg).data.pathData;
        assert.equal(pathData.length % 4, 0, "pathData length should be a multiple of 4");
        
        let lastLC = -1.0;
        for(let i=0; i<pathData.length; i += 4) {
            const lc = pathData[i + 2];
            assert.isAbove(lc, lastLC);
            lastLC = lc;
        }
    });
});
