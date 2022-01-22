let gl: WebGLRenderingContext | null = null;

const options: WebGLContextAttributes = {};

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
}

export function getContext(): WebGLRenderingContext {
    if (!gl) {
        throw new Error("No WebGL context available");
    }

    return gl;
}

function updateSize() {
    if (gl === null) {
        return;
    }

    const canvas = gl.canvas;

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
