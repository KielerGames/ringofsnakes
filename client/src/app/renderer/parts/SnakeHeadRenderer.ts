import Snake from "../../data/snake/Snake";
import Matrix from "../../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as SkinManager from "../SkinLoader";
import * as WebGLContextProvider from "../WebGLContextProvider";
import assert from "../../util/assert";

declare const __VERTEXSHADER_HEAD__: string;
declare const __FRAGMENTSHADER_HEAD__: string;

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

    shader = new WebGLShaderProgram(gl, __VERTEXSHADER_HEAD__, __FRAGMENTSHADER_HEAD__);

    // send data to GPU (once)
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
})();

export function render(snakes: Iterable<Snake>, transform: Matrix) {
    const gl = WebGLContextProvider.getContext();

    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);

    for (const snake of snakes) {
        if (!snake.hasChunks()) {
            continue;
        }

        const { x, y } = snake.position;
        shader.setUniform("uSnakeWidth", 1.25 * snake.width);
        shader.setUniform("uHeadPosition", [x, y]);
        shader.setUniform("uHeadRotation", snake.direction + rotOffset);
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
