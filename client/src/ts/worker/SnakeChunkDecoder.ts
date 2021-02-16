import { GameConfig } from "../protocol/client-server";
import { SnakeChunkData } from "../protocol/main-worker";

const SNAKE_CHUNK_MAX_BYTES = 128;
const SNAKE_CHUNK_HEADER_SIZE = 21;

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
 * 5-8       end direction (float)
 * 9-12      end position x (float)
 * 13-16     end position y (float)
 * 17-20     offset within snake (float)
 * ================= CONTENT ===================
 * 21-(21+n) n ChainCodes (n bytes), 21+n < 128
 */

export function decode(
    config: GameConfig,
    chunkBuffer: ArrayBuffer
): SnakeChunkData {
    const view = new DataView(chunkBuffer);

    // validate data
    if (
        chunkBuffer.byteLength < SNAKE_CHUNK_HEADER_SIZE ||
        chunkBuffer.byteLength > SNAKE_CHUNK_MAX_BYTES
    ) {
        throw new Error("Invalid snake chunk size: " + chunkBuffer.byteLength);
    }

    // read chunk header
    const snakeId = view.getUint16(0, false);
    const chunkId = view.getUint16(2, false);
    const n = view.getUint8(4);
    const width = 0.5; // TODO
    let alpha = view.getFloat32(5, false);
    let x = view.getFloat32(9, false),
        y = view.getFloat32(13, false);
    const offset = view.getFloat32(17, false);

    // initialize variables
    let length = 0.0;
    const vertexBuffer = new Float32Array(8 * (n + 1));
    addPointToVertexBuffer(vertexBuffer, 0, x, y, alpha, width, length);
    let minX = x,
        maxX = x,
        minY = y,
        maxY = y;

    for (let i = 0; i < n; i++) {
        const data = view.getUint8(SNAKE_CHUNK_HEADER_SIZE + i);

        // decode chaincode
        const fast = (data & FAST_BIT) > 0;
        const steps = 1 + ((data & STEPS_MASK) >> 4);
        const dirDelta = decodeDirectionChange(config, data & DIRECTION_MASK);

        // compute alphas
        const midAlpha = alpha + 0.5 * dirDelta;
        alpha += dirDelta;
        if (Math.abs(alpha) > Math.PI) {
            alpha += (alpha < 0 ? 2 : -2) * Math.PI;
        }

        // compute next (center) position
        const s = steps * (fast ? config.fastSnakeSpeed : config.snakeSpeed);
        x += s * Math.cos(alpha);
        y += s * Math.sin(alpha);
        length += s;

        // store in vertex buffer
        addPointToVertexBuffer(
            vertexBuffer,
            i + 1,
            x,
            y,
            midAlpha,
            width,
            length
        );
    }

    return {
        snakeId,
        chunkId,
        glVertexBuffer: vertexBuffer.buffer,
        vertices: (n + 1) * 2,
        length,
        offset,
        viewBox: {
            minX: minX - 0.5 * width,
            maxX: maxX + 0.5 * width,
            minY: minY - 0.5 * width,
            maxY: maxY + 0.5 * width,
        },
        end: {
            x,
            y,
        },
        full: chunkBuffer.byteLength === SNAKE_CHUNK_MAX_BYTES - 1, //TODO: fix
    };
}

function addPointToVertexBuffer(
    vb: Float32Array,
    k: number,
    x: number,
    y: number,
    alpha: number,
    width: number,
    length: number
): void {
    const normalAlpha = alpha - 0.5 * Math.PI;

    // compute normal vector
    const nx = Math.cos(normalAlpha);
    const ny = Math.sin(normalAlpha);

    // update vertex buffer:
    const vbo = 8 * k;

    // right vertex
    vb[vbo + 0] = x + width * nx;
    vb[vbo + 1] = y + width * ny;
    vb[vbo + 2] = length;
    vb[vbo + 3] = 1.0;

    // left vertex
    vb[vbo + 4] = x - width * nx;
    vb[vbo + 5] = y - width * ny;
    vb[vbo + 6] = length;
    vb[vbo + 7] = -1.0;
}

function decodeDirectionChange(config: GameConfig, data: number) {
    const sign = 1 - ((data & 1) << 1);
    const k = sign * Math.floor(data / 2);
    return (k * config.maxTurnDelta) / 7.0;
}
