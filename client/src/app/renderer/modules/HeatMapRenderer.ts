import Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import assert from "../../util/assert";
import Vector from "../../math/Vector";

declare const __VERTEXSHADER_HEATMAP__: string;
declare const __FRAGMENTSHADER_HEATMAP__: string;

let gl: WebGLRenderingContext;
let shaderProgram: WebGLShaderProgram;
let buffer: WebGLBuffer;

export function setCanvas(canvas: HTMLCanvasElement): void {
    gl = canvas.getContext("webgl", { alpha: true })!;

    if (gl === null) {
        throw new Error();
    }

    gl.disable(WebGLRenderingContext.DEPTH_TEST);

    shaderProgram = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_HEATMAP__,
        __FRAGMENTSHADER_HEATMAP__,
        ["aAbsPosition"]
    );

    buffer = gl.createBuffer()!;
    assert(buffer !== null);

    if (__DEBUG__) {
        console.info(`HeatMapRenderer initialized.`);
    }
}

export function render(game: Readonly<Game>): void {
    if (gl === undefined || gl.isContextLost()) {
        return;
    }

    const position = game.camera.position;

    shaderProgram.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    shaderProgram.setUniform("uCameraPosition", worldToMapCoordinates(game, game.camera.position));
    position;
    // TODO
}

function worldToMapCoordinates(game: Readonly<Game>, worldPosition: Vector): [number, number] {
    const cc = game.config.chunks;
    const halfWidth = cc.columns * cc.size,
        halfHeight = cc.rows * cc.size;
    return [worldPosition.x / halfWidth, worldPosition.y / halfHeight];
}
