import { dialog } from "../../ui/Dialogs";
import AsyncEvent from "../../util/AsyncEvent";
import requireNonNull from "../../util/requireNonNull";

const options: WebGLContextAttributes = {
    alpha: true, // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_alphafalse_which_can_be_expensive
    depth: false,
    antialias: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance"
};

const loaded = new AsyncEvent();
let gl: WebGL2RenderingContext | null = null;

export function init(canvas: HTMLCanvasElement): void {
    const ctx = requireNonNull(
        canvas.getContext("webgl2", options),
        "Failed to create WebGL context."
    );

    ctx.disable(ctx.DEPTH_TEST);
    ctx.enable(ctx.BLEND);

    // https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 1);

    canvas.addEventListener("webglcontextlost", (e) => {
        console.error("WebGL context lost.", e);
        dialog({
            title: "Error",
            content: "The WebGL context has been lost. Reloading the page should fix the issue.",
            buttons: [
                {
                    label: "Reload",
                    action: () => window.location.reload()
                }
            ]
        });
    });

    // Best Mipmap quality (default is DONT_CARE, there is also FASTEST)
    ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.NICEST);

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
