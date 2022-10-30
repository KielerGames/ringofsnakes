/*eslint no-bitwise: "off"*/

import type { GameConfig } from "../../data/config/GameConfig";
import type { FoodChunkDTO } from "../../data/dto/FoodChunkDTO";
import type { DecodeResult } from "./DecodeResult";

export const NUM_SKINS = 7;
const FOOD_BYTE_SIZE = 3;
const FOOD_CHUNK_HEADER_SIZE = 4;
const SIZE_BIT_OFFSET = 6;
const COLOR_BIT_MASK = (1 << SIZE_BIT_OFFSET) - 1;
const FOOD_SIZES = [0.64, 1.0, 1.5];
const VERTEX_BYTE_SIZE =
    2 * Float32Array.BYTES_PER_ELEMENT + // position (x,y),
    2 * Float32Array.BYTES_PER_ELEMENT + // wiggle parameters,
    Float32Array.BYTES_PER_ELEMENT + // size,
    Int32Array.BYTES_PER_ELEMENT; // color

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

        // Create seeds for random float generation based on the given
        // bits s.t. they are consistent (same input => same output).
        const seedA = bx ^ by ^ colorAndSize;
        const seedB = rotateBits(seedA, 4);

        // Encode data for vertex buffer.
        const vbOffset = i * VERTEX_BYTE_SIZE;
        encView.setFloat32(vbOffset + 0, x, true);
        encView.setFloat32(vbOffset + 4, y, true);
        encView.setFloat32(vbOffset + 8, wiggleSpeed(seedA), true);
        encView.setFloat32(vbOffset + 12, wiggleSpeed(seedB), true);
        encView.setFloat32(vbOffset + 16, size, true);
        encView.setInt32(vbOffset + 20, color % NUM_SKINS, true);
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

function wiggleSpeed(seed: number): number {
    const sign = 2 * (Math.clz32(seed) & 1) - 1;
    const epsilon = 0.75 * (seed / 256);
    return sign * (1.0 + epsilon);
}

/**
 * Rotate bits of byte by digits.
 */
function rotateBits(byte: number, digits: number): number {
    digits = digits & 7;
    return ((byte << digits) | (byte >> (8 - digits))) & 255;
}
