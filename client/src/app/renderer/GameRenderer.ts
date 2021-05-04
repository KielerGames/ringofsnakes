import GameData from "../data/GameData";
import Matrix from "../math/Matrix";
import * as SnakeChunkRenderer from "./SnakeChunkRenderer";

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
}

export function render(data: GameData): void {
    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // world scale
    scale.setEntry(0, 0, 0.042);
    scale.setEntry(1, 1, 0.042);

    // move camera to target snake
    translate.setEntry(0, 3, -data.camera.position.x);
    translate.setEntry(1, 3, -data.camera.position.y);

    const transform = Matrix.compose(
        Matrix.compose(unstretch, scale),
        translate
    );

    SnakeChunkRenderer.render(
        data.getChunks(),
        transform,
        data.timeSinceLastUpdate()
    );
}
