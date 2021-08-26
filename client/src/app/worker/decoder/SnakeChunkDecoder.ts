import { DecodeResult } from "./DecodeResult";
import { GameConfig } from "../../protocol";
import { normalizeAngle } from "../../math/utils";

const SNAKE_CHUNK_MAX_BYTES = 128;
export const SNAKE_CHUNK_HEADER_SIZE = 21;
export const FULL_CHUNK_NUM_POINTS =
    SNAKE_CHUNK_MAX_BYTES - SNAKE_CHUNK_HEADER_SIZE + 1;

// chaincode
const FAST_BIT = 1 << 7;
const STEPS_MASK = 7 << 4;
const DIRECTION_MASK = 15;

type OrientedPoint = {
    x: number;
    y: number;
    alpha: number;
};

export type DecodedSnakeChunk = {
    snakeId: number;
    chunkId: number;
    pathLength: number;
    pathOffset: number;
    full: boolean;
    points: number;
    start: OrientedPoint;
    end: OrientedPoint;
    pathData: Float32Array;
};

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
): DecodeResult<DecodedSnakeChunk> {
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

    // initialize variables
    let length = 0.0;
    let pathData = new Float32Array(4 * (n + 1));
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
        const s = steps * (fast ? config.fastSnakeSpeed : config.snakeSpeed);
        x += s * Math.cos(alpha);
        y += s * Math.sin(alpha);
        length += s;

        const idx = 4 * (i + 1);
        pathData[idx + 0] = x;
        pathData[idx + 1] = y;
        pathData[idx + 2] = length;
        pathData[idx + 3] = midAlpha;
    }

    pathData[pathData.length - 1] = alpha;

    // avoid f32 rounding issues later
    // this way pathData[idx + 2] is always less or equal to length
    length = Math.max(length, pathData[pathData.length - 2]);

    return {
        data: {
            snakeId,
            chunkId,
            pathLength: length,
            pathOffset: chunkOffset,
            full,
            points: n + 1,
            // the end point where pathData starts (further away from snake head)
            start: {
                x: pathData[0],
                y: pathData[1],
                alpha: pathData[3]
            },
            // the end point closest to the snake head
            end: {
                x,
                y,
                alpha
            },
            pathData
        },
        nextByteOffset: byteOffset + SNAKE_CHUNK_HEADER_SIZE + n
    };
}

function decodeDirectionChange(config: GameConfig, data: number) {
    const sign = 1 - ((data & 1) << 1);
    const k = sign * Math.floor(data / 2);
    return (k * config.maxTurnDelta) / 7.0;
}
