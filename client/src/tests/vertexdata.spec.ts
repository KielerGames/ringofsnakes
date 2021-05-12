import { assert } from "chai";
import { createWorkerChunk } from "./data/snake";
import VBBuilder from "../app/worker/SnakeChunkVertexBufferBuilder";
import Rand from "rand-seed";

function abs(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

function createRandomVB(rand: Rand) {
    const s = 0.2 + 1.8 * rand.next();
    const n = 10 + Math.floor(rand.next() * 20);

    const builder = new VBBuilder(n, (n-1)*s);
    let x = 0,
        y = 0;
    let alpha = 2.0 * Math.PI * rand.next();
    let offset = 0.0;

    for (let i = 0; i < n; i++) {
        alpha += (rand.next() - 0.5) / 42;
        x += Math.cos(alpha) * s;
        y += Math.sin(alpha) * s;
        offset += s;
        builder.addPoint(x, y, alpha, offset);
    }

    return builder.getBuffer();
}

describe("ChunkVertexData", () => {
    describe("WorkerChunk.createWebGlData", () => {
        it("should have some vertices", () => {
            const chunk = createWorkerChunk(42);
            const data = chunk.createTransferData();
            assert.isAbove(data.vertices, 0);
        });

        it("a vertex should have 6 components", () => {
            const chunk = createWorkerChunk(7);
            const data = chunk.createTransferData();
            assert.equal(data.data.length % 6, 0, "Not a multiple of 6!");
        });

        it("the number of vertices should match data.data", () => {
            const chunk = createWorkerChunk(13);
            const data = chunk.createTransferData();
            // non-final chunks have room for 2 extra vertices (for client-side-prediciton)
            assert.equal(data.data.length / 6, data.vertices);
        });
    });

    describe("SnakeChunkVertexBufferBuilder", () => {
        it("the normal component should have length 1", () => {
            const buffer = createRandomVB(new Rand("seed"));

            for (let i = 0; i < buffer.length; i += 6) {
                const nx = buffer[i + 2];
                const ny = buffer[i + 3];
                assert.approximately(abs(nx, ny), 1.0, 1e-7);
            }
        });

        it("the side component should be 1 or -1", () => {
            const buffer = createRandomVB(new Rand("another seed"));

            for (let i = 0; i < buffer.length; i += 6) {
                const side = buffer[i + 4];
                assert.equal(Math.abs(side), 1.0);
            }
        });

        it("left and right vertex should have the same x & y components", () => {
            const buffer = createRandomVB(new Rand("a third seed"));

            for (let i = 0; i < buffer.length; i += 12) {
                const x1 = buffer[i + 0];
                const y1 = buffer[i + 1];

                const x2 = buffer[i + 6];
                const y2 = buffer[i + 7];

                assert.equal(x1, x2);
                assert.equal(y1, y2);
            }
        });

        it("a vertex buffer may not be empty", () => {
            assert.throws(() => {
                let vb = new VBBuilder(0, 0.0);
            });
        });
    });
});
