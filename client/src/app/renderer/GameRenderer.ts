import { Camera } from "../data/Camera";
import GameData from "../data/GameData";
import Matrix from "../math/Matrix";
import * as SnakeChunkRenderer from "./SnakeChunkRenderer";
import * as SnakeHeadRenderer from "./SnakeHeadRenderer";

let gl: WebGLRenderingContext;

const unstretch = new Matrix();
const scale = new Matrix();
const translate = new Matrix();

export function init(parentNode: HTMLElement = document.body): void {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    unstretch.setEntry(0, 0, canvas.height / canvas.width);

    gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: false,
    })!;

    gl.disable(gl.DEPTH_TEST);

    parentNode.appendChild(canvas);

    SnakeChunkRenderer.init(gl);
    SnakeHeadRenderer.init(gl);
}

export function render(data: GameData, camera: Camera, time: number): void {
    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // world scale
    const s = 0.042;
    scale.setEntry(0, 0, s);
    scale.setEntry(1, 1, s);

    // move camera to target snake
    translate.setEntry(0, 2, -camera.position.x);
    translate.setEntry(1, 2, -camera.position.y);

    const transform = Matrix.compose(
        Matrix.compose(unstretch, scale),
        translate
    );

    const pTime = data.timeSinceLastUpdate(time);

    // render snake bodies
    SnakeChunkRenderer.render(data.getChunks(), transform, pTime);

    // render snake heads
    SnakeHeadRenderer.render(data.getSnakes(), transform, pTime);
}
