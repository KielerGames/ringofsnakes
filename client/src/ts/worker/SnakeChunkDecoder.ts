import { SnakeChunkData } from "../protocol/main-worker";

const SNAKE_CHUNK_MAX_BYTES = 64;
const SNAKE_CHUNK_HEADER_SIZE = 0;

// chaincode
const STEP_SIZE = 5.0;
const MAX_DELTA = Math.PI / 90; // 2deg
const FAST_BIT = 1<<7;
const STEPS_MASK = 7<<4;
const DIRECTION_MASK = 15;

export function decode(chunkBuffer: ArrayBuffer): SnakeChunkData {
    const view = new DataView(chunkBuffer);

    // validate data
    if (chunkBuffer.byteLength > SNAKE_CHUNK_MAX_BYTES) {
        throw new Error("Invalid snake chunk size: " + chunkBuffer.byteLength);
    }

    // TODO: read from (not yet existing) header
    const width = 1;
    let alpha = 0;
    let x = 0,
        y = 0;
    const n = 64;

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
        const steps = 1 + ((data & STEPS_MASK)>>4);
        const dirDelta = decodeDirectionChange(data & DIRECTION_MASK);

        // compute alphas
        const midAlpha = alpha + 0.5 * dirDelta;
        alpha += dirDelta;
        if (Math.abs(alpha) > Math.PI) {
            alpha += (alpha < 0 ? 2 : -2) * Math.PI;
        }

        // compute next (center) position
        const s = steps * (fast ? 1.2 : 1) * STEP_SIZE;
        x += s * Math.cos(alpha);
        y += s * Math.sin(alpha);
        length += s;

        // store in vertex buffer
        addPointToVertexBuffer(vertexBuffer, i + 1, x, y, midAlpha, width, length);
    }

    return {
        glVertexBuffer: vertexBuffer.buffer,
        vertices: (n+1)*2,
        length,
        viewBox: {
            minX: minX - width,
            maxX: maxX + width,
            minY: minY - width,
            maxY: maxY + width,
        },
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

function decodeDirectionChange(data:number) {
    const sign = 1 - ((data & 1)<<1);
    const k = sign * Math.floor(data/2);
    return k * MAX_DELTA / 7.0;
}
