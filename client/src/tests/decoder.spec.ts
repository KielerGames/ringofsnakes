import { assert } from "chai";

import * as SCD from "../app/worker/decoder/SnakeChunkDecoder";
import * as SID from "../app/worker/decoder/SnakeInfoDecoder";
import { GameConfig } from "../app/protocol";
import { createSnakeChunkBuffer } from "./data/snake";

const cfg: GameConfig = {
    snakeSpeed: 0.24,
    fastSnakeSpeed: 0.48,
    maxTurnDelta: Math.PI / 30,
    tickDuration: 1.0 / 25,
};

describe("Decoder", () => {
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
            const n = 42;
            const buffer = createSnakeChunkBuffer(n);
            const pathLength = SCD.decode(buffer, 0, cfg).data.pathLength;
            assert.isAtLeast(pathLength, n * cfg.snakeSpeed);
    
            const s = 4.2;
            const fasterCfg: GameConfig = Object.assign({}, cfg, {
                snakeSpeed: s * cfg.snakeSpeed,
                fastSnakeSpeed: s * cfg.fastSnakeSpeed,
            });
            assert.approximately(
                SCD.decode(buffer, 0, fasterCfg).data.pathLength,
                4.2 * pathLength,
                1e-5
            );
        });
    
        it("pathData length component should increase monotonically", () => {
            const buffer = createSnakeChunkBuffer(42);
            const pathData = SCD.decode(buffer, 0, cfg).data.pathData;
            assert.equal(
                pathData.length % 4,
                0,
                "pathData length should be a multiple of 4"
            );
    
            let last = -1.0;
            for (let i = 0; i < pathData.length; i += 4) {
                const lc = pathData[i + 2];
                assert.isAbove(lc, last);
                last = lc;
            }
        });
    
        it("should be a straight line", () => {
            const buffer = createSnakeChunkBuffer(13, { x: 0, y: 0, alpha: 0 }, null);
    
            const pathData = SCD.decode(buffer, 0, cfg).data.pathData;
            assert.equal(
                pathData.length % 4,
                0,
                "pathData length should be a multiple of 4"
            );
    
            let lastX = -1.0;
            for (let i = 0; i < pathData.length; i += 4) {
                let x = pathData[i];
                let y = pathData[i + 1];
                let alpha = pathData[i + 3];
                assert.isAbove(x, lastX);
                lastX = x;
                assert.approximately(y, 0.0, 1e-8);
                assert.approximately(alpha, 0.0, 1e-8);
            }
        });
    });

    // ============================================================

    describe("SnakeInfoDecoder", () => {
        it("should accept valid buffers", () => {
            const buffer = new Uint8Array(20).buffer;
            assert.doesNotThrow(() => SID.decode(buffer, 0));
        });
    });
});
