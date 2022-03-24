import Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import assert from "../../util/assert";

declare const __VERTEXSHADER_HEATMAP__: string;
declare const __FRAGMENTSHADER_HEATMAP__: string;

let shaderProgram: WebGLShaderProgram;
let buffer: WebGLBuffer;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    shaderProgram = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_HEATMAP__,
        __FRAGMENTSHADER_HEATMAP__,
        ["aAbsPosition"]
    );

    buffer = gl.createBuffer()!;
    assert(buffer !== null);
})();

export function render(game: Readonly<Game>): void {
    const gl = WebGLContextProvider.getContext();
    const position = game.camera.position;

    shaderProgram.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    shaderProgram.setUniform("uCameraPosition", [0, 0]); // TODO

    position;
    // TODO
}
