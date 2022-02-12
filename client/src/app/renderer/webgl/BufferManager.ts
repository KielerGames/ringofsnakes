import * as WebGLContextProvider from "./WebGLContextProvider";

const freeBuffers: WebGLBuffer[] = [];
const initialBuffers = 16;
const upperLimit = 128;

(async () => {
    if (initialBuffers > 0) {
        const gl = await WebGLContextProvider.waitForContext();

        for (let i = 0; i < initialBuffers; i++) {
            freeBuffers.push(createBuffer(gl));
        }
    }
})();

export function create(): WebGLBuffer {
    if (freeBuffers.length > 0) {
        return freeBuffers.pop()!;
    } else {
        return createBuffer(WebGLContextProvider.getContext());
    }
}

export function free(buffer: WebGLBuffer): void {
    if (freeBuffers.length < upperLimit) {
        freeBuffers.push(buffer);
    }
    if (__DEBUG__ && freeBuffers.length === upperLimit) {
        console.warn(`Free buffer cache limit (${upperLimit}) reached.`);
    }
}

function createBuffer(gl: WebGLRenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer();

    if (buffer === null) {
        throw new Error("Failed to create buffer.");
    }

    return buffer;
}
