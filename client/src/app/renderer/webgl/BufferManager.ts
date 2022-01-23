import assert from "../../util/assert";
import * as WebGLContextProvider from "../WebGLContextProvider";

const freeBuffers: WebGLBuffer[] = [];
const initialBuffers = 16;

(async () => {
    assert(initialBuffers >= 0);
    const gl = await WebGLContextProvider.waitForContext();

    for (let i = 0; i < initialBuffers; i++) {
        const buffer = gl.createBuffer();
        assert(buffer != null, "Buffer is null");
        freeBuffers.push(buffer!);
    }
})();

export function create(): WebGLBuffer {
    const gl = WebGLContextProvider.getContext();

    if (freeBuffers.length > 0) {
        return freeBuffers.pop()!;
    } else {
        const buffer = gl.createBuffer();
        assert(buffer != null, "Buffer is null");
        return buffer!;
    }
}

export function free(buffer: WebGLBuffer): void {
    freeBuffers.push(buffer);
}
