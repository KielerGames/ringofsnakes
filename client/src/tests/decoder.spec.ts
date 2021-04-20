import { assert } from "chai";
import Rand from "rand-seed";

import * as SCD from "../app/worker/decoder/SnakeChunkDecoder";
import { GameConfig } from "../app/protocol";

const cfg: GameConfig = {
    snakeSpeed: 0.24,
    fastSnakeSpeed: 0.48,
    maxTurnDelta: Math.PI / 30,
    tickDuration: 1.0 / 25,
};

function createSnakeChunkBuffer(
    numberOfChainCodes: number,
    init = { x: 0, y: 0, alpha: 0 },
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

    if (random) {
        const offset = SCD.SNAKE_CHUNK_HEADER_SIZE;

        for (let i = 0; i < numberOfChainCodes; i++) {
            data[offset + i] = Math.floor(random.next() * 256);
        }
    }

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
            1e-8
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
