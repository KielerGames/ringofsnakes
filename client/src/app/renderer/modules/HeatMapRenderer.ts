import Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import assert from "../../util/assert";
import Vector from "../../math/Vector";
import Matrix from "../../math/Matrix";

declare const __VERTEXSHADER_HEATMAP__: string;
declare const __FRAGMENTSHADER_HEATMAP__: string;

const transform = new Matrix(true);
let shaderProgram: WebGLShaderProgram;
let buffer: WebGLBuffer;
let texture: WebGLTexture;

// prettier-ignore
const boxCoords = new Float32Array([
    0.0, 1.0, // top-left
    1.0, 1.0, // top-right
    0.0, 0.0, // bottom-left
    1.0, 0.0  // bottom-right
]);

const heatMapSize = 128;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    shaderProgram = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_HEATMAP__,
        __FRAGMENTSHADER_HEATMAP__
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
})();

export async function render(game: Readonly<Game>): Promise<void> {
    const gl = await WebGLContextProvider.waitForContext();

    shaderProgram.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    updateTransformMatrix(gl);

    gl.activeTexture(WebGLRenderingContext.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);

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

    shaderProgram.setUniform("uHeatMapTexture", 2);

    const position = game.camera.position;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, boxCoords.buffer, gl.STATIC_DRAW);

    shaderProgram.setUniform("uCameraPosition", worldToMapCoordinates(game, position));
    shaderProgram.setUniform("uTransform", transform.data);

    shaderProgram.run(4, { mode: gl.TRIANGLE_STRIP });
}

function updateTransformMatrix(gl: WebGLRenderingContext): void {
    const { width: cw, height: ch } = gl.canvas;
    const sx = 2.0 / cw;
    const sy = 2.0 / ch;
    const offset = 10;

    transform.setEntry(0, 0, sx * heatMapSize);
    transform.setEntry(1, 1, sy * heatMapSize);
    transform.setEntry(0, 2, 1.0 - sx * (heatMapSize + offset));
    transform.setEntry(1, 2, -1.0 + sy * offset);
}

function worldToMapCoordinates(game: Readonly<Game>, worldPosition: Vector): [number, number] {
    const cc = game.config.chunks;
    const width = cc.columns * cc.size;
    const height = cc.rows * cc.size;
    return [(0.5 * width + worldPosition.x) / width, (0.5 * height + worldPosition.y) / height];
}
