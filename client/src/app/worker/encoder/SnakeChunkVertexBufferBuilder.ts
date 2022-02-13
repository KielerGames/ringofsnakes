import assert from "../../util/assert";

export const VERTEX_SIZE = 6;

export default class SnakeChunkVertexBufferBuilder {
    readonly vertices: number;
    readonly buffer: Float32Array;
    private readonly pathPoints: number;
    private readonly chunkPathLength: number;
    private position: number = 0;

    constructor(numPoints: number, chunkLength: number) {
        assert(numPoints > 0);
        assert(chunkLength > 0.0);

        this.pathPoints = numPoints;
        this.vertices = 2 * this.pathPoints; // triangle strip format
        this.chunkPathLength = chunkLength;

        this.buffer = new Float32Array(this.vertices * VERTEX_SIZE);
    }

    addPoint(x: number, y: number, alpha: number, pathOffset: number): void {
        const vb = this.buffer;
        if (this.position >= vb.length) {
            throw new RangeError("Cannot add another point to vertex buffer!");
        }

        // current position in vertex buffer
        let pos = this.position;
        this.position += 2 * VERTEX_SIZE;

        // compute normal vector
        const normalAlpha = alpha - 0.5 * Math.PI;
        const nx = Math.cos(normalAlpha);
        const ny = Math.sin(normalAlpha);

        // path distance to chunk end (end point closest to snake head)
        const pathDist = this.chunkPathLength - pathOffset;

        // right vertex
        vb[pos + 0] = x;
        vb[pos + 1] = y;
        vb[pos + 2] = nx;
        vb[pos + 3] = ny;
        vb[pos + 4] = 1.0;
        vb[pos + 5] = pathDist;

        pos += VERTEX_SIZE;

        // left vertex
        vb[pos + 0] = x;
        vb[pos + 1] = y;
        vb[pos + 2] = nx;
        vb[pos + 3] = ny;
        vb[pos + 4] = -1.0;
        vb[pos + 5] = pathDist;
    }
}
