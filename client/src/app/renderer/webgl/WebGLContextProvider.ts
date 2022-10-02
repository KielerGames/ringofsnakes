import { dialog } from "../../ui/Dialogs";
import AsyncEvent from "../../util/AsyncEvent";

const options: WebGLContextAttributes = {
    alpha: true, // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_alphafalse_which_can_be_expensive
    depth: false,
    antialias: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false
};

const loaded = new AsyncEvent();
let gl: WebGLRenderingContext | null = null;

export function init(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("webgl2", options);

    if (ctx === null) {
        throw new Error("Failed to create WebGL context.");
    }

    ctx.disable(WebGLRenderingContext.DEPTH_TEST);
    ctx.enable(WebGLRenderingContext.BLEND);

    // https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    ctx.pixelStorei(WebGLRenderingContext.UNPACK_ALIGNMENT, 1);

    canvas.addEventListener("webglcontextlost", (e) => {
        console.error("WebGL context lost.", e);
        dialog({
            title: "Error",
            content: "The WebGL context has been lost. Reload the page should fix the issue.",
            buttons: [
                {
                    label: "Reload",
                    action: () => window.location.reload()
                }
            ]
        });
    });

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
