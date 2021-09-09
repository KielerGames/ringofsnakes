import Snake from "../data/Snake";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_HEAD__: string;
declare const __FRAGMENTSHADER_HEAD__: string;
type Color = [number, number, number];

let gl: WebGLRenderingContext;
let buffer: WebGLBuffer;
let shader: WebGLShaderProgram;

const VERTEX_SIZE = 2;
const vertexData = mirror([
    [0.5, -1.0],
    [1.0, 0.0],
    [0.4, 2.0]
]);
const rotOffset = -0.5 * Math.PI;

const snakeColors: Color[] = [
    [0.5, 0.75, 1.0],
    [1.0, 0.75, 0.5],
    [0.75, 1.0, 0.5]
];

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;
    buffer = gl.createBuffer()!;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_HEAD__,
        __FRAGMENTSHADER_HEAD__
    );

    // send data to GPU (once)
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
}

export function render(
    snakes: Iterable<Snake>,
    transform: Matrix,
    timeSinceLastTick: number
) {
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);

    for (const snake of snakes) {
        const { x, y } = snake.getPredictedPosition(timeSinceLastTick);
        shader.setUniform("uSnakeWidth", 1.25 * snake.width);
        shader.setUniform("uHeadPosition", [x, y]);
        shader.setUniform(
            "uHeadRotation",
            snake.direction.predict(timeSinceLastTick) + rotOffset
        );
        setSkin(snake.skin);
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

function setSkin(skin: number): void {
    const colorIdx = Math.max(0, skin % snakeColors.length);
    shader.setUniform("uColor", snakeColors[colorIdx]);
}
