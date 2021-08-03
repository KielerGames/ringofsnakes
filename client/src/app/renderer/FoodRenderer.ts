import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let shader: WebGLShaderProgram;

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_FOOD__,
        __FRAGMENTSHADER_FOOD__
    );
}

export function render(transform: Matrix) {
    shader.use();

    //TODO
}
