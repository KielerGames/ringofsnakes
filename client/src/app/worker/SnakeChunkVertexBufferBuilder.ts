import assert from "../utilities/assert";

declare const __DEBUG__:boolean;
const VERTEX_SIZE = 6;

export default class SnakeChunkVertexBufferBuilder {
    private vertices: number;
    private buffer: Float32Array;
    private position: number = 0;
    private chunkPathLength: number;

    public constructor(numPoints: number, chunkLength: number) {
        assert(numPoints > 0);
        assert(chunkLength > 0.0);

        this.vertices = numPoints;
        this.chunkPathLength = chunkLength;

        // triangle strip format
        this.buffer = new Float32Array(2 * VERTEX_SIZE * this.vertices);
    }

    public addPoint(
        x: number,
        y: number,
        alpha: number,
        pathOffset: number
    ): void {
        const vb = this.buffer;
        if(this.position >= vb.length) {
            throw new RangeError("Cannot add another point to vertex buffer!");
        }

        // current position in vertex buffer
        const pos = this.position;
        assert(pos < this.vertices);
        this.position++;

        // compute normal vector
        const normalAlpha = alpha - 0.5 * Math.PI;
        const nx = Math.cos(normalAlpha);
        const ny = Math.sin(normalAlpha);

        // path distance to chunk end (end point closest to snake head)
        const pathDist = this.chunkPathLength - pathOffset;

        // right vertex
        {
            const vbo = 2 * VERTEX_SIZE * pos;
            vb[vbo + 0] = x;
            vb[vbo + 1] = y;
            vb[vbo + 2] = nx;
            vb[vbo + 3] = ny;
            vb[vbo + 4] = 1.0;
            vb[vbo + 5] = pathDist;
        }

        // left vertex
        {
            const vbo = 2 * VERTEX_SIZE * pos + VERTEX_SIZE;
            vb[vbo + 0] = x;
            vb[vbo + 1] = y;
            vb[vbo + 2] = nx;
            vb[vbo + 3] = ny;
            vb[vbo + 4] = -1.0;
            vb[vbo + 5] = pathDist;
        }
    }

    public getBuffer(): Float32Array {
        return this.buffer;        
    }
}
