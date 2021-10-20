import SnakeChunk from "../data/SnakeChunk";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as BoxRenderer from "./BoxRenderer";
import * as SkinManager from "./SkinManager";

declare const __VERTEXSHADER_SNAKE__: string;
declare const __FRAGMENTSHADER_SNAKE__: string;

let gl: WebGLRenderingContext;
let basicMaterialShader: WebGLShaderProgram;
let buffer: WebGLBuffer;

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;

    basicMaterialShader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SNAKE__,
        __FRAGMENTSHADER_SNAKE__,
        ["vPosition", "vNormal", "vNormalOffset", "vRelativePathOffset"]
    );

    buffer = gl.createBuffer()!;
}

export function render(
    chunks: Iterable<SnakeChunk>,
    transform: Matrix,
    timeSinceLastTick: number
): void {
    const shader = basicMaterialShader;
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);
    shader.setUniform("uColorSampler", 0);

    for (const chunk of chunks) {
        const snake = chunk.snake;

        SkinManager.setColor(shader, "uSkin", snake.skin);
        shader.setUniform("uChunkPathOffset", chunk.offset(timeSinceLastTick));
        shader.setUniform("uSnakeLength", snake.length);
        shader.setUniform("uSnakeMaxWidth", snake.maxWidth);
        shader.setUniform(
            "uSnakeThinningStart",
            Math.min(0.75, snake.length * 0.025) * snake.length
        );

        gl.bufferData(gl.ARRAY_BUFFER, chunk.buffer, gl.STREAM_DRAW);
        shader.run(chunk.vertices, { mode: gl.TRIANGLE_STRIP });

        if (__DEBUG__) {
            BoxRenderer.addBox(
                chunk.getBoundingBox(),
                chunk.final ? [1, 1.0, 0.1, 0.42] : [1, 0.5, 0, 0.25]
            );
        }
    }
}
