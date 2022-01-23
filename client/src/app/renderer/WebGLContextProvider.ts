import AsyncEvent from "../util/AsyncEvent";

const options: WebGLContextAttributes = {
    alpha: false,
    depth: false,
    antialias: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false
};

let gl: WebGLRenderingContext | null = null;
let loaded = new AsyncEvent();

export function init(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("webgl", options);

    if (ctx === null) {
        throw new Error("Failed to create WebGL context.");
    }

    ctx.disable(WebGLRenderingContext.DEPTH_TEST);
    ctx.enable(WebGLRenderingContext.BLEND);

    updateSize();

    if (__DEBUG__) {
        console.info("Canvas initialized.");
    }

    gl = ctx;
    loaded.set();
}

export function getContext(): WebGLRenderingContext {
    if (!gl) {
        throw new Error("No WebGL context available");
    }

    return gl;
}

export async function waitForContext(): Promise<WebGLRenderingContext> {
    if (!loaded.isSet()) {
        await loaded.wait();
    }

    return getContext();
}

function updateSize() {
    if (gl === null) {
        return;
    }

    const canvas = gl.canvas as HTMLCanvasElement;

    // get current canvas size in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        if (__DEBUG__) {
            console.info("Resizing canvas...");
        }

        // resize canvas
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // update clip space to screen pixel transformation
        gl.viewport(0, 0, displayWidth, displayHeight);
    }
}

window.addEventListener("resize", updateSize);
