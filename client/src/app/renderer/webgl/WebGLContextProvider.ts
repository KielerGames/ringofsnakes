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
let gl: WebGL2RenderingContext | null = null;

export function init(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("webgl2", options);

    if (ctx === null) {
        throw new Error("Failed to create WebGL context.");
    }

    ctx.disable(WebGL2RenderingContext.DEPTH_TEST);
    ctx.enable(WebGL2RenderingContext.BLEND);

    // https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    ctx.pixelStorei(WebGL2RenderingContext.UNPACK_ALIGNMENT, 1);

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

export function getContext(): WebGL2RenderingContext {
    if (!gl) {
        throw new Error("No WebGL context available");
    }

    return gl;
}

export async function waitForContext(): Promise<WebGL2RenderingContext> {
    if (!loaded.isSet()) {
        await loaded.wait();
    }

    return getContext();
}
