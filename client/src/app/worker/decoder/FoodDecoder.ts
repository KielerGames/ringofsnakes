import { GameConfig } from "../../types/GameConfig";
import { DecodeResult } from "./DecodeResult";

const FOOD_SIZE = 3;
const FOOD_CHUNK_HEADER_SIZE = 4;
const SIZE_BIT_OFFSET = 6;
const COLOR_BIT_MASK = (1 << SIZE_BIT_OFFSET) - 1;
const FOOD_SIZES = [0.64, 1.0, 1.5];

export function decode(
    buffer: ArrayBuffer,
    offset: number,
    config: GameConfig
): DecodeResult<FoodChunkDTO> {
    const view = new DataView(buffer, offset);
    const chunkSize = config.chunks.chunkSize;

    const column = view.getUint8(0);
    const row = view.getUint8(1);
    const n = view.getUint16(2, false);
    const chunkId = view.getUint16(0, false);

    const xOffset = (column - 0.5 * config.chunks.columns) * chunkSize;
    const yOffset = (row - 0.5 * config.chunks.rows) * chunkSize;

    const foodItems: FoodItemDTO[] = new Array(n);

    for (let i = 0; i < n; i++) {
        const foodOffset = FOOD_CHUNK_HEADER_SIZE + i * FOOD_SIZE;
        const bx = view.getInt8(foodOffset + 0) + 128;
        const by = view.getInt8(foodOffset + 1) + 128;
        const colorAndSize = view.getUint8(foodOffset + 2);

        const size = FOOD_SIZES[colorAndSize >> SIZE_BIT_OFFSET];
        const color = colorAndSize & COLOR_BIT_MASK;

        const x = xOffset + (bx / 256) * chunkSize;
        const y = yOffset + (by / 256) * chunkSize;

        foodItems[i] = { x, y, size, color };
    }

    return {
        data: {
            id: chunkId,
            items: foodItems,
            bounds: {
                minX: xOffset,
                maxX: xOffset + chunkSize,
                minY: yOffset,
                maxY: yOffset + chunkSize
            }
        },
        nextByteOffset: offset + FOOD_CHUNK_HEADER_SIZE + n * FOOD_SIZE
    };
}

export type FoodItemDTO = {
    x: number;
    y: number;
    size: number;
    color: number;
};

export type FoodChunkId = number;

export type FoodChunkDTO = {
    id: FoodChunkId;
    items: FoodItemDTO[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
};
