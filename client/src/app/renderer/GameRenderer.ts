import { Camera } from "../data/Camera";
import GameData from "../data/GameData";
import * as SnakeChunkRenderer from "./SnakeChunkRenderer";
import * as SnakeHeadRenderer from "./SnakeHeadRenderer";
import * as FoodRenderer from "./FoodRenderer";
import * as BoxRenderer from "./BoxRenderer";
import * as BufferManager from "../webgl/BufferManager";

let gl: WebGLRenderingContext;

export function init(parentNode: HTMLElement = document.body): void {
    // create canvas element
    const canvas = document.createElement("canvas");
    canvas.id = "main-canvas";
    parentNode.appendChild(canvas);

    // init gl context
    gl = canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        antialias: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: false
    })!;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    resize(true);

    // init other render modules
    BufferManager.init(gl, 16);
    SnakeChunkRenderer.init(gl);
    SnakeHeadRenderer.init(gl);
    FoodRenderer.init(gl);

    if (__DEBUG__) {
        BoxRenderer.init(gl);
    }
}

export function render(data: GameData, camera: Camera, time: number): void {
    // resize canvas (only if needed)
    resize();

    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const canvas = gl.canvas;
    const transform = camera.getTransformMatrix(canvas.width, canvas.height);

    const pTime = data.timeSinceLastUpdate(time);

    FoodRenderer.render(data.getFoodChunks(), data.getTargetSnake, transform);

    // render snake bodies
    SnakeChunkRenderer.render(data.getSnakeChunks(), transform, pTime);

    // render snake heads
    SnakeHeadRenderer.render(data.getSnakes(), transform, pTime);

    if (__DEBUG__) {
        BoxRenderer.renderAll(transform);
    }
}

function resize(force: boolean = false) {
    const canvas = gl.canvas as HTMLCanvasElement;

    // get current canvas size in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const needResize =
        canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (force || needResize) {
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
