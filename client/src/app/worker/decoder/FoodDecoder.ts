import Food from "../../data/Food";
import FoodChunk from "../../data/FoodChunk";
import { GameConfig } from "../../protocol";
import { DecodeResult } from "./DecodeResult";

const FOOD_SIZE = 3;
const FOOD_CHUNK_HEADER_SIZE = 4;
const SIZE_BIT_OFFSET = 4;
const COLOR_BIT_MASK = (1 << SIZE_BIT_OFFSET) - 1;

export function decode(
    buffer: ArrayBuffer,
    offset: number,
    config: GameConfig
): DecodeResult<FoodChunk> {
    const view = new DataView(buffer, offset);
    const chunkSize = config.chunkInfo.chunkSize;

    const column = view.getUint8(0);
    const row = view.getUint8(1);
    const n = view.getUint16(2, false);
    const chunkId = view.getUint16(0, false);

    const xOffset = (column - 0.5 * config.chunkInfo.columns) * chunkSize;
    const yOffset = (row - 0.5 * config.chunkInfo.rows) * chunkSize;

    const foodItems: Food[] = new Array(n);

    for (let i = 0; i < n; i++) {
        const foodOffset = FOOD_CHUNK_HEADER_SIZE + i * FOOD_SIZE;
        const bx = view.getInt8(foodOffset + 0) + 128;
        const by = view.getInt8(foodOffset + 1) + 128;
        const colorAndSize = view.getUint8(foodOffset + 2);

        const size = colorAndSize >> SIZE_BIT_OFFSET;
        const color = colorAndSize & COLOR_BIT_MASK;

        const x = xOffset + (bx / 256) * chunkSize;
        const y = yOffset + (by / 256) * chunkSize;

        foodItems[i] = new Food(x, y, size, color);
    }

    return {
        data: new FoodChunk(chunkId, foodItems),
        nextByteOffset: offset + FOOD_CHUNK_HEADER_SIZE + n * FOOD_SIZE
    };
}
