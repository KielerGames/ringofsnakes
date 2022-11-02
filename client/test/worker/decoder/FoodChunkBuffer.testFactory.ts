import Rand from "rand-seed";
import {
    FOOD_BYTE_SIZE,
    FOOD_CHUNK_HEADER_SIZE
} from "../../../src/app/worker/decoder/FoodDecoder";

export function createRandomFoodUpdateBuffer(rand: Rand): ArrayBuffer {
    const n = Math.floor(512 * rand.next());
    const buffer = new ArrayBuffer(FOOD_CHUNK_HEADER_SIZE + n * FOOD_BYTE_SIZE);
    const view = new DataView(buffer);

    // header
    view.setUint8(0, Math.floor(256 * rand.next()));
    view.setUint8(1, Math.floor(256 * rand.next()));
    view.setUint16(2, n, false);

    // foot items
    expect(FOOD_BYTE_SIZE).toBe(3);
    for (let i = 0; i < n; i++) {
        const offset = FOOD_CHUNK_HEADER_SIZE + i * FOOD_BYTE_SIZE;

        view.setUint8(offset + 0, Math.floor(rand.next() * 256));
        view.setUint8(offset + 1, Math.floor(rand.next() * 256));
        view.setUint8(offset + 2, Math.floor(rand.next() * 256));
    }

    return buffer;
}
