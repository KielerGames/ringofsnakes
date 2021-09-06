import FoodChunk from "../data/FoodChunk";
import Snake from "../data/Snake";
import Matrix from "../math/Matrix";
import Vector from "../math/Vector";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let shader: WebGLShaderProgram;
let texture: WebGLTexture;

const colors = new Uint8Array([
    255, 25, 12, // red
    0, 128, 255, // blue
    25, 255, 42, // green
    255, 0, 255  // pink
]);

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

    texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        colors.length / 3,
        1,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        colors
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

export function render(foodChunks: Iterable<FoodChunk>, targetSnake: Snake | undefined, transform: Matrix) {
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shader.setUniform("uColorSampler", 0);
    shader.setUniform("uTransform", transform.data);

    const attractor = targetSnake ? targetSnake.getPredictedPosition(0) : FAR_AWAY;
    shader.setUniform("uPlayerPosition", [attractor.x, attractor.y]);

    for (const chunk of foodChunks) {
        chunk.useBuffer(gl);

        shader.run(chunk.numberOfVertices, {
            stride: FOOD_VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT
        });
    }
}
