import assert from "../utilities/assert";

const VERTEX_SIZE = 6;

export default class SnakeChunkVertexBufferBuilder {
    private vertices: number;
    private buffer: Float32Array;
    private position: number = 0;

    public constructor(numPoints: number) {
        assert(numPoints > 0);
        this.vertices = numPoints;

        // triangle strip
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
            throw new Error("Cannot add another point to vertex buffer!");
        }

        // current position in vertex buffer
        const pos = this.position;
        assert(pos < this.vertices);
        this.position++;

        // compute normal vector
        const normalAlpha = alpha - 0.5 * Math.PI;
        const nx = Math.cos(normalAlpha);
        const ny = Math.sin(normalAlpha);

        // vertex buffer offset
        const vbo = 2 * VERTEX_SIZE * pos;

        // right vertex
        vb[vbo + 0] = x;
        vb[vbo + 1] = y;
        vb[vbo + 2] = nx;
        vb[vbo + 3] = ny;
        vb[vbo + 4] = 1.0;
        vb[vbo + 5] = pathOffset;

        // left vertex
        vb[vbo + 0] = x;
        vb[vbo + 1] = y;
        vb[vbo + 2] = nx;
        vb[vbo + 3] = ny;
        vb[vbo + 4] = -1.0;
        vb[vbo + 5] = pathOffset;
    }

    public getBuffer(): Float32Array {
        return this.buffer;        
    }
}
