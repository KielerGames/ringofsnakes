import { ReadonlyMatrix } from "../../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as SkinManager from "../SkinLoader";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import assert from "../../util/assert";
import Game from "../../data/Game";
import { compileShader } from "../webgl/ShaderLoader";

let buffer: WebGLBuffer;
let shader: WebGLShaderProgram;

const VERTEX_SIZE = 2;
const vertexData = mirror([
    [0.5, -1.0],
    [1.0, 0.0],
    [0.4, 2.0]
]);
const rotOffset = -0.5 * Math.PI;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    buffer = gl.createBuffer()!;
    assert(buffer !== null);

    shader = await compileShader(gl, "head");

    // send data to GPU (once)
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    const gl = WebGLContextProvider.getContext();

    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);

    for (const snake of game.snakes.values()) {
        if (!snake.hasChunks() || !snake.isHeadVisible(game.camera)) {
            continue;
        }

        const { x, y } = snake.position;
        shader.setUniform("uSnakeWidth", 1.25 * snake.width);
        shader.setUniform("uHeadPosition", [x, y]);
        shader.setUniform("uHeadRotation", snake.direction + rotOffset);
        shader.setUniform("uSnakeFast", snake.smoothedFastValue);
        SkinManager.setColor(shader, "uSkin", snake.skin);

        shader.run(vertexData.length / VERTEX_SIZE, {
            mode: gl.TRIANGLE_STRIP
        });
    }
}

function mirror(points: [number, number][]): Float32Array {
    const data = new Float32Array(VERTEX_SIZE * points.length * 2);

    let i = 0;
    for (const [x, y] of points) {
        // left
        data[i++] = -x;
        data[i++] = y;
        // right
        data[i++] = x;
        data[i++] = y;
    }

    return data;
}
