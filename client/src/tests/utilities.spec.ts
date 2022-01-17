import { assert } from "chai";
import RingBuffer from "../app/utilities/RingBuffer";

describe("Utilities", () => {
    describe("RingBuffer", () => {
        it("should work like a simple array", () => {
            const n = 42;
            const rb = new RingBuffer(n);
            assert.equal(rb.size, 0);

            for(let i=0; i<n; i++) {
                rb.add(i);
                assert.equal(rb.size, i+1);
            }

            const rbData = rb.getAll();
            assert.equal(rbData.length, n);

            for(let i=0; i<n; i++) {
                assert.equal(rbData[i], i);
            }
        });

        it("should remember the last value", () => {
            const rb = new RingBuffer(1);

            for(let i=0; i<42; i++) {
                rb.add(i);
                assert.equal(rb.size, 1);
                const rbData = rb.getAll();
                assert.equal(rbData.length, 1);
                assert.equal(rbData[0], i);
            }
        })
    });
});
