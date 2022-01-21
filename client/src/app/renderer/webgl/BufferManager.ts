import assert from "../../util/assert";

const freeBuffers: WebGLBuffer[] = [];
let ctx: WebGLRenderingContext;

export function init(gl: WebGLRenderingContext, buffers: number): void {
    ctx = gl;
    assert(buffers >= 0);

    freeBuffers.length = 0;
    for (let i = 0; i < buffers; i++) {
        const buffer = gl.createBuffer();
        assert(buffer != null, "Buffer is null");
        freeBuffers.push(buffer!);
    }
}

export function create(): WebGLBuffer {
    if (freeBuffers.length > 0) {
        return freeBuffers.pop()!;
    } else {
        const buffer = ctx.createBuffer();
        assert(buffer != null, "Buffer is null");
        return buffer!;
    }
}

export function free(buffer: WebGLBuffer): void {
    freeBuffers.push(buffer);
}
