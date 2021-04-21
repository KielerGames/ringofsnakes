import SnakeChunk from "../data/SnakeChunk";
import assert from "../utilities/assert";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __DEBUG__: boolean;
declare const __VERTEXSHADER_SNAKE__: string;
declare const __FRAGMENTSHADER_SNAKE__: string;
type Color = [number, number, number];

let gl: WebGLRenderingContext;
let basicMaterialShader: WebGLShaderProgram;
let buffer: WebGLBuffer;

let snakeColors: Color[] = [
    [0.5, 0.75, 1.0],
    [1.0, 0.75, 0.5],
    [0.75, 1.0, 0.5],
];

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;

    basicMaterialShader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SNAKE__,
        __FRAGMENTSHADER_SNAKE__
    );
    basicMaterialShader.bufferLayout = [
        "vPosition",
        "vNormal",
        "vNormalOffset",
        "vRelativePathOffset",
    ];

    buffer = gl.createBuffer()!;

    assert(snakeColors.length > 0);
}

export function render(
    chunks: Iterable<SnakeChunk>,
    transform: Matrix,
    timeSinceLastTick: number
): void {
    const shader = basicMaterialShader;
    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);

    let nc = 0;
    let nv = 0;
    for (const chunk of chunks) {
        const snake = chunk.snake;
        setSkin(snake.skin);
        shader.setUniform("uChunkPathOffset", chunk.offset(timeSinceLastTick));
        shader.setUniform("uSnakeLength", snake.length);
        shader.setUniform("uSnakeWidth", snake.width);

        gl.bufferData(gl.ARRAY_BUFFER, chunk.buffer, gl.STREAM_DRAW);
        shader.run(gl.TRIANGLE_STRIP, 0, chunk.vertices);
        nc++;
        nv += chunk.vertices;
    }

    // if (__DEBUG__) {
    //     console.info(`Rendered ${nc} chunks (${nv} vertices).`);
    // }
}

function setSkin(skin: number): void {
    let colorIdx = Math.max(0, skin % snakeColors.length);
    basicMaterialShader.setUniform("uColor", snakeColors[colorIdx]);
}
