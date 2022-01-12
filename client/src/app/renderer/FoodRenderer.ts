import FoodChunk from "../data/FoodChunk";
import Snake from "../data/Snake";
import Matrix from "../math/Matrix";
import Vector from "../math/Vector";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as BoxRenderer from "./BoxRenderer";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let shader: WebGLShaderProgram;

const FOOD_VERTEX_SIZE = FoodChunk.FOOD_VERTEX_SIZE;
const FAR_AWAY = new Vector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_FOOD__,
        __FRAGMENTSHADER_FOOD__,
        ["aPosition", "aLocalPos", "aColorIndex"]
    );
}

export function render(
    foodChunks: Iterable<FoodChunk>,
    targetSnake: Snake | undefined,
    transform: Matrix
) {
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    shader.setUniform("uColorSampler", 0);
    shader.setUniform("uTransform", transform.data);

    const attractor = targetSnake
        ? targetSnake.getPredictedPosition(0)
        : FAR_AWAY;
    shader.setUniform("uPlayerPosition", [attractor.x, attractor.y]);

    for (const chunk of foodChunks) {
        chunk.useBuffer(gl);

        shader.run(chunk.numberOfVertices, {
            stride: FOOD_VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT
        });

        if (__DEBUG__) {
            BoxRenderer.addBox(chunk.box, [0.1, 0.5, 1, 0.333]);
        }
    }
}
