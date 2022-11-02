/*eslint no-bitwise: "off"*/

import type { GameConfig } from "../../data/config/GameConfig";
import type { FoodChunkDTO } from "../../data/dto/FoodChunkDTO";
import type { DecodeResult } from "./DecodeResult";
import Random from "../../util/Random";

export const NUM_SKINS = 7;
export const FOOD_CHUNK_HEADER_SIZE = 4;
export const FOOD_BYTE_SIZE = 3;
const SIZE_BIT_OFFSET = 6;
const COLOR_BIT_MASK = (1 << SIZE_BIT_OFFSET) - 1;
const FOOD_SIZES = [0.64, 1.0, 1.5];
const VERTEX_BYTE_SIZE =
    2 * Float32Array.BYTES_PER_ELEMENT + // position (x,y),
    3 * Float32Array.BYTES_PER_ELEMENT + // wiggle parameters,
    Float32Array.BYTES_PER_ELEMENT + // size,
    Int32Array.BYTES_PER_ELEMENT; // color

const random = new Random();

export function decode(
    buffer: ArrayBuffer,
    offset: number,
    config: GameConfig
): DecodeResult<FoodChunkDTO> {
    const decView = new DataView(buffer, offset);
    const chunkSize = config.chunks.size;

    const n = decView.getUint16(2, false);

    // Chunk related stuff.
    const chunkId = decView.getUint16(0, false);
    const column = decView.getUint8(0);
    const row = decView.getUint8(1);
    const xOffset = (column - 0.5 * config.chunks.columns) * chunkSize;
    const yOffset = (row - 0.5 * config.chunks.rows) * chunkSize;

    // Output vars.
    const vertexBuffer = new ArrayBuffer(n * VERTEX_BYTE_SIZE);
    const encView = new DataView(vertexBuffer);

    // Iterate over food items.
    for (let i = 0; i < n; i++) {
        const foodOffset = FOOD_CHUNK_HEADER_SIZE + i * FOOD_BYTE_SIZE;

        // Unpack relative position.
        const bx = decView.getInt8(foodOffset + 0) + 128;
        const by = decView.getInt8(foodOffset + 1) + 128;

        // Unpack color and size.
        const colorAndSize = decView.getUint8(foodOffset + 2);
        const size = FOOD_SIZES[colorAndSize >> SIZE_BIT_OFFSET];
        const color = colorAndSize & COLOR_BIT_MASK;

        // Compute absolute position.
        const x = xOffset + (bx / 256) * chunkSize;
        const y = yOffset + (by / 256) * chunkSize;

        // Create a seed for random float generation based on the given
        // bits s.t. they are consistent (same input => same output).
        random.setSeed((decView.getUint16(foodOffset) << 8) | colorAndSize);

        // Encode data for vertex buffer.
        const vbOffset = i * VERTEX_BYTE_SIZE;
        encView.setFloat32(vbOffset + 0, x, true);
        encView.setFloat32(vbOffset + 4, y, true);
        encView.setFloat32(vbOffset + 8, randomWiggleSpeed(), true);
        encView.setFloat32(vbOffset + 12, randomWiggleSpeed(), true);
        encView.setFloat32(vbOffset + 16, randomWiggleSpeed(), true);
        encView.setFloat32(vbOffset + 20, size, true);
        encView.setInt32(vbOffset + 24, color % NUM_SKINS, true);
    }

    return {
        data: {
            id: chunkId,
            vertexBuffer,
            count: n,
            bounds: {
                minX: xOffset,
                maxX: xOffset + chunkSize,
                minY: yOffset,
                maxY: yOffset + chunkSize
            }
        },
        nextByteOffset: offset + FOOD_CHUNK_HEADER_SIZE + n * FOOD_BYTE_SIZE
    };
}

function randomWiggleSpeed(): number {
    const sign = random.nextBoolean() ? 1 : -1;
    const rand = random.nextFloat();
    return sign * (0.75 + 0.85 * rand * rand);
}
