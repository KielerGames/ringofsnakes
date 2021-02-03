import * as CCD from "./ChainCodeDecoder";

const SNAKE_CHUNK_MAX_BYTES = 64;
const SNAKE_CHUNK_HEADER_SIZE = 0;
const STEP_SIZE = 5.0;

export type SnakeChunkData = {
    glVertexBuffer: ArrayBuffer;
    viewBox: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    length: number;
};

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
    const vertexBuffer = new Float32Array(8 * (n + 1));
    addPointToVertexBuffer(vertexBuffer, 0, x, y, alpha, width);
    let minX = x,
        maxX = x,
        minY = y,
        maxY = y;

    for (let i = 0; i < n; i++) {
        const data = CCD.decode(view.getUint8(SNAKE_CHUNK_HEADER_SIZE + i));
        const midAlpha = alpha + 0.5 * data.dirDelta;

        // compute next alpha
        alpha += data.dirDelta;
        if (Math.abs(alpha) > Math.PI) {
            alpha += (alpha < 0 ? 2 : -2) * Math.PI;
        }

        // compute next (center) position
        x += STEP_SIZE * Math.cos(alpha);
        y += STEP_SIZE * Math.sin(alpha);
        length += STEP_SIZE;

        // store in vertex buffer
        addPointToVertexBuffer(vertexBuffer, i + 1, x, y, midAlpha, width);
    }

    return {
        glVertexBuffer: vertexBuffer,
        length: 0,
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
    width: number
): void {
    const normalAlpha = alpha - 0.5 * Math.PI;

    // compute normal vector
    const nx = Math.cos(normalAlpha);
    const ny = Math.sin(normalAlpha);

    // update vertex buffer:
    const vbo = 8 * k;

    // left vertex
    vb[vbo + 0] = x - width * nx;
    vb[vbo + 1] = y - width * ny;
    vb[vbo + 2] = length;
    vb[vbo + 3] = -1.0;

    // right vertex
    vb[vbo + 4] = x + width * nx;
    vb[vbo + 5] = y + width * ny;
    vb[vbo + 6] = length;
    vb[vbo + 7] = 1.0;
}
