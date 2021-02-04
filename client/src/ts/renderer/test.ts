import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_SNAKE__: string;
declare const __FRAGMENTSHADER_SNAKE__: string;

export function test() {
    console.log("vertex shader: ", __VERTEXSHADER_SNAKE__);
    console.log("fragment shader: ", __FRAGMENTSHADER_SNAKE__);

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl")!;
    const p = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SNAKE__,
        __FRAGMENTSHADER_SNAKE__,
        true
    );
}
