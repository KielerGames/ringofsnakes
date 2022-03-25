import Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import assert from "../../util/assert";
import Vector from "../../math/Vector";
import { updateCanvasSize } from "../webgl/WebGLUtils";

declare const __VERTEXSHADER_HEATMAP__: string;
declare const __FRAGMENTSHADER_HEATMAP__: string;

let gl: WebGLRenderingContext | null = null;
let shaderProgram: WebGLShaderProgram;
let buffer: WebGLBuffer;
let texture: WebGLTexture;

const boxCoords = new Float32Array([
    -1.0,
    1.0, // top-left
    1.0,
    1.0, // top-right
    -1.0,
    -1.0, // bottom-left
    1.0,
    -1.0 // bottom-right
]);

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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, boxCoords.buffer, gl.STATIC_DRAW);

    texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (__DEBUG__) {
        console.info(`HeatMapRenderer initialized.`);
    }
}

export function render(game: Readonly<Game>): void {
    if (gl === null || gl.isContextLost()) {
        return;
    }

    updateCanvasSize(gl);
    shaderProgram.use();

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const format = gl.LUMINANCE;

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        game.config.chunks.columns,
        game.config.chunks.rows,
        0,
        format,
        gl.UNSIGNED_BYTE,
        game.heatMap
    );

    gl.activeTexture(WebGLRenderingContext.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shaderProgram.setUniform("uHeatMapTexture", 2);

    const position = game.camera.position;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    shaderProgram.setUniform("uCameraPosition", worldToMapCoordinates(game, position));

    shaderProgram.run(4, { mode: gl.TRIANGLE_STRIP });
}

function worldToMapCoordinates(game: Readonly<Game>, worldPosition: Vector): [number, number] {
    const cc = game.config.chunks;
    const halfWidth = cc.columns * cc.size,
        halfHeight = cc.rows * cc.size;
    return [worldPosition.x / halfWidth, worldPosition.y / halfHeight];
}
