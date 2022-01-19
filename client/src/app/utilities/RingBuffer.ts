/**
 * Like an array with a fixed capacity n. Stores the last n added values.
 */
export default class RingBuffer {
    #data: Float64Array;
    #start: number;
    #next: number;
    #length: number;
    #total: number;

    constructor(capacity: number) {
        if (capacity <= 0) {
            throw new Error("Capacity must be positive.");
        }
        this.#data = new Float64Array(capacity);
        this.#length = 0;
        this.#start = 0;
        this.#next = 0;
        this.#total = 0;
    }

    add(value: number): void {
        const capacity = this.#data.length;
        this.#data[this.#next] = value;
        this.#next = (this.#next + 1) % capacity;
        const newLength = Math.min(this.#length + 1, capacity);

        if(newLength > this.#length && this.#length === capacity) {
            this.#start = (this.#start + 1) % capacity;
        }

        this.#length = newLength;
        this.#total++;
    }

    getAll(): Float64Array {
        console.info("ring buffer length: " + this.#length);
        const result = new Float64Array(this.#length);
        for(let i=0; i<this.#length; i++) {
            const j = (this.#start + i) % this.#data.length;
            result[i] = this.#data[j];
        }
        return result;
    }

    get size(): number {
        return this.#length;
    }

    get total(): number {
        return this.#total;
    }
}