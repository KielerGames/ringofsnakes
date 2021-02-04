import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_SNAKE__: string;
declare const __FRAGMENTSHADER_SNAKE__: string;

export function createSnakeShaderProgram(gl: WebGLRenderingContext): WebGLShaderProgram {
    return new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SNAKE__,
        __FRAGMENTSHADER_SNAKE__,
        true
    );
}
