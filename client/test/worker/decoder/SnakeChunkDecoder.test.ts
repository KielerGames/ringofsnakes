import Rand from "rand-seed";
import { VERTEX_SIZE } from "../../../src/app/worker/encoder/SnakeChunkVertexBufferBuilder";
import * as SCD from "../../../src/app/worker/decoder/SnakeChunkDecoder";
import defaultConfig from "../../data/config/GameConfig.prefab";
import { createSnakeChunkBuffer } from "./SnakeChunkBuffer.testFactory";

describe("SnakeChunkDecoder", () => {
    it("should accept valid buffers", () => {
        const buffer = createSnakeChunkBuffer(1);
        expect(() => SCD.decode(buffer, 0, defaultConfig)).not.toThrow();
    });

    it("should reject buffers that are too small", () => {
        expect(() => {
            const buffer = new Uint8Array(1).buffer;
            SCD.decode(buffer, 0, defaultConfig);
        }).toThrowError(RangeError);

        expect(() => {
            const numberOfChainCodes = 2;
            // create a buffer that is too small...
            const data = new Uint8Array(
                SCD.SNAKE_CHUNK_HEADER_SIZE + numberOfChainCodes - 1
            );
            data[4] = numberOfChainCodes;
            SCD.decode(data.buffer, 0, defaultConfig);
        }).toThrowError(RangeError);

        expect(() => {
            const buffer = createSnakeChunkBuffer(1);
            SCD.decode(buffer, 13, defaultConfig);
        }).toThrowError(RangeError);
    });

    test("chunk length should behave linearly", () => {
        const n = 42;
        const buffer = createSnakeChunkBuffer(n);
        const pathLength = SCD.decode(buffer, 0, defaultConfig).data.length;
        expect(pathLength).toBeGreaterThanOrEqual(
            n * defaultConfig.snakes.speed
        );

        const s = 4.2;
        const fasterCfg = {
            ...defaultConfig,
            snakes: {
                ...defaultConfig.snakes,
                speed: s * defaultConfig.snakes.speed,
                fastSpeed: s * defaultConfig.snakes.fastSpeed
            }
        };

        expect(SCD.decode(buffer, 0, fasterCfg).data.length).toBeCloseTo(
            s * pathLength,
            4
        );
    });

    test("vertex offset component should decrease monotonically", () => {
        expect(5).toBeLessThan(VERTEX_SIZE);

        const buffer = createSnakeChunkBuffer(42);
        const vertexData = SCD.decode(buffer, 0, defaultConfig).data.data;

        // data length should be a multiple of VERTEX_SIZE
        expect(vertexData.length % (2 * VERTEX_SIZE)).toBe(0);

        let last = Number.POSITIVE_INFINITY;
        for (let i = 0; i < vertexData.length; i += 2 * VERTEX_SIZE) {
            const oc1 = vertexData[i + 5];
            const oc2 = vertexData[i + 5 + VERTEX_SIZE];
            expect(oc1).toBeLessThan(last);
            expect(oc1).toBe(oc2);
            last = oc1;
        }
    });

    test("vertex offset should be bounded by chunk length", () => {
        const rand = new Rand("vertex offset seed");
        for (let i = 0; i < 42; i++) {
            const n = 1 + Math.floor(63 * rand.next());
            const buffer = createSnakeChunkBuffer(n, undefined, rand);
            const decoded = SCD.decode(buffer, 0, defaultConfig).data;
            const vertexData = decoded.data;

            // data length should be a multiple of VERTEX_SIZE
            expect(vertexData.length % VERTEX_SIZE).toBe(0);

            for (let j = 0; j < vertexData.length; j += VERTEX_SIZE) {
                const pathOffset = vertexData[j + 5];
                expect(pathOffset).toBeGreaterThanOrEqual(0.0);
                expect(pathOffset).toBeLessThanOrEqual(decoded.length);
            }
        }
    });

    test("should be a straight line", () => {
        const buffer = createSnakeChunkBuffer(
            13,
            { x: 0, y: 0, alpha: 0 },
            null
        );

        const vertexData = SCD.decode(buffer, 0, defaultConfig).data.data;
        // data length should be a multiple of VERTEX_SIZE
        expect(vertexData.length % (2 * VERTEX_SIZE)).toBe(0);

        let lastX = -1;
        for (let i = 0; i < vertexData.length; i += 2 * VERTEX_SIZE) {
            const x = vertexData[i];
            const y = vertexData[i + 1];
            expect(x).toBeGreaterThan(lastX);
            lastX = x;
            expect(y).toBeCloseTo(0.0, 8);
        }
    });
});
