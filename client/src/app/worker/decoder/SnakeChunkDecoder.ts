/*eslint no-bitwise: "off"*/

import { DecodeResult } from "./DecodeResult";
import { normalizeAngle } from "../../math/Angle";
import { GameConfig } from "../../data/config/GameConfig";
import Rectangle from "../../math/Rectangle";
import { SnakeChunkDTO } from "../../data/dto/SnakeChunkDTO";
import SnakeChunkVertexBufferBuilder from "../encoder/SnakeChunkVertexBufferBuilder";

const SNAKE_CHUNK_MAX_BYTES = 96;
export const SNAKE_CHUNK_HEADER_SIZE = 21;
export const FULL_CHUNK_NUM_POINTS = SNAKE_CHUNK_MAX_BYTES - SNAKE_CHUNK_HEADER_SIZE + 1;
const PATH_VERTEX_SIZE = 4;

// chaincode
const FAST_BIT = 1 << 7;
const STEPS_MASK = 7 << 4;
const DIRECTION_MASK = 15;

/*
 * Byte(s) | Description
 * ================= HEADER ===================
 * 0-1       snake id (short)
 * 2-3       chunk id (short)
 * 4         n: number of chain codes in this chunk (byte)
 * 5-8       start direction (float)
 * 9-12      start position x (float)
 * 13-16     start position y (float)
 * 17-20     offset within snake (float)
 * ================== BODY ====================
 * 21-(21+n) n ChainCodes (n bytes), 21+n < 128
 */

export function decode(
    buffer: ArrayBuffer,
    byteOffset: number,
    config: GameConfig
): DecodeResult<SnakeChunkDTO> {
    const view = new DataView(buffer, byteOffset);

    if (view.byteLength < SNAKE_CHUNK_HEADER_SIZE) {
        throw new RangeError("Invalid buffer (too small for header)");
    }

    // read chunk header
    const snakeId = view.getUint16(0, false);
    // combine snake id & chunk id to unqiue chunk id
    const chunkId = view.getUint32(0, false);
    const n = view.getUint8(4);
    let alpha = view.getFloat32(5, false);
    let x = view.getFloat32(9, false),
        y = view.getFloat32(13, false);
    const chunkOffset = view.getFloat32(17, false);
    const full = SNAKE_CHUNK_HEADER_SIZE + n === SNAKE_CHUNK_MAX_BYTES;

    // verify
    if (!full && chunkOffset !== 0.0) {
        throw new Error(`Invalid chunk offset value: ${chunkOffset}`);
    }
    if (view.byteLength < SNAKE_CHUNK_HEADER_SIZE + n) {
        throw new RangeError("Invalid buffer (too small)");
    }

    const points = n + 1;

    // initialize variables
    const pathData = new Float32Array(4 * points);
    let length = 0.0;
    let minX, maxX, minY, maxY;
    minX = maxX = x;
    minY = maxY = y;

    // start vertex
    pathData[0] = x;
    pathData[1] = y;
    pathData[2] = length;
    pathData[3] = alpha;

    // decode body (n vertices)
    for (let i = 0; i < n; i++) {
        // get chaincode i
        const data = view.getUint8(SNAKE_CHUNK_HEADER_SIZE + i);

        // decode chaincode
        const fast = (data & FAST_BIT) > 0;
        const steps = 1 + ((data & STEPS_MASK) >> 4);
        const dirDelta = decodeDirectionChange(config, data & DIRECTION_MASK);

        // compute alphas
        const midAlpha = alpha + 0.5 * dirDelta;
        alpha = normalizeAngle(alpha + dirDelta);

        // compute next position
        const s = steps * (fast ? config.snakes.fastSpeed : config.snakes.speed);
        x += s * Math.cos(alpha);
        y += s * Math.sin(alpha);
        length += s;

        // store data
        const idx = 4 * (i + 1);
        pathData[idx + 0] = x;
        pathData[idx + 1] = y;
        pathData[idx + 2] = length;
        pathData[idx + 3] = midAlpha;

        // update bounds
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    pathData[pathData.length - 1] = alpha;

    // avoid f32 rounding issues later
    // this way pathData[idx + 2] is always less or equal to length
    length = Math.max(length, pathData[pathData.length - 2]);

    const builder = new SnakeChunkVertexBufferBuilder(points, length);

    for (let i = 0; i < points; i++) {
        const pdo = PATH_VERTEX_SIZE * i;

        builder.addPoint(
            pathData[pdo + 0], // x
            pathData[pdo + 1], // y
            pathData[pdo + 3], // alpha
            pathData[pdo + 2] //  path offset
        );
    }

    const box = new Rectangle(minX, maxX, minY, maxY);

    return {
        data: {
            id: chunkId,
            snakeId,
            length,
            offset: chunkOffset,
            full,
            vertices: 2 * points,
            data: builder.buffer,
            boundingBox: box.createTransferable()
        },
        nextByteOffset: byteOffset + SNAKE_CHUNK_HEADER_SIZE + n
    };
}

function decodeDirectionChange(config: GameConfig, data: number) {
    const sign = 1 - ((data & 1) << 1);
    const k = sign * Math.floor(data / 2);
    return (k * config.snakes.maxTurnDelta) / 7.0;
}
