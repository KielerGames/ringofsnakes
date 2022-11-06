/* eslint-disable no-bitwise */
// Copied and adapted from https://github.com/raybellis/java-random
// which is based on Javas Random.

const p2_16 = 0x0000000010000;
const p2_24 = 0x0000001000000;
const p2_27 = 0x0000008000000;
const p2_32 = 0x0000100000000;
const p2_48 = 0x1000000000000;
const p2_53 = Math.pow(2, 53); // NB: exceeds Number.MAX_SAFE_INTEGER

const m2_16 = 0xffff;

//
// multiplicative term for the PRNG
//
const [c2, c1, c0] = [0x0005, 0xdeec, 0xe66d];

export default class Random {
    #s0: number;
    #s1: number;
    #s2: number;

    constructor(seedval?: number) {
        // perform seed initialisation
        if (seedval === undefined) {
            seedval = Math.floor(Math.random() * p2_48);
        }
        this.setSeed(seedval);
    }

    nextBoolean(): boolean {
        return this.#next(1) != 0;
    }

    nextFloat(): number {
        return this.#next(24) / p2_24;
    }

    nextDouble(): number {
        return (p2_27 * this.#next(26) + this.#next(27)) / p2_53;
    }

    /**
     * 53-bit safe version of
     * seed = (seed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1)
     */
    #nextSeed(): number {
        let carry = 0xb;

        let r0 = this.#s0 * c0 + carry;
        carry = r0 >>> 16;
        r0 &= m2_16;

        let r1 = this.#s1 * c0 + this.#s0 * c1 + carry;
        carry = r1 >>> 16;
        r1 &= m2_16;

        let r2 = this.#s2 * c0 + this.#s1 * c1 + this.#s0 * c2 + carry;
        r2 &= m2_16;

        [this.#s2, this.#s1, this.#s0] = [r2, r1, r0];

        return this.#s2 * p2_16 + this.#s1;
    }

    #next(bits: number): number {
        return this.#nextSeed() >>> (32 - bits);
    }

    /**
     * 53-bit safe version of
     * seed = (seed ^ 0x5DEECE66DL) & ((1L << 48) - 1)
     */
    setSeed(n: number): void {
        this.#checkIsPositiveInt(n);
        this.#s0 = (n & m2_16) ^ c0;
        this.#s1 = ((n / p2_16) & m2_16) ^ c1;
        this.#s2 = ((n / p2_32) & m2_16) ^ c2;
    }

    #checkIsPositiveInt(n: number, r = Number.MAX_SAFE_INTEGER): void {
        if (n < 0 || n > r) {
            throw RangeError();
        }
    }
}
