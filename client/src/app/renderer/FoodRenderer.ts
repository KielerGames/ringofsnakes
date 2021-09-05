import Food from "../data/Food";
import FoodChunk from "../data/FoodChunk";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let buffer: WebGLBuffer;
let shader: WebGLShaderProgram;
let texture: WebGLTexture;

const boxCoords = [
    // triangle 1
    [-1.0, 1.0], // top-left
    [1.0, 1.0], // top-right
    [-1.0, -1.0], // bottom-left
    // triangle 2
    [-1.0, -1.0], // bottom-left
    [1.0, 1.0], // top-right
    [1.0, -1.0] // bottom-right
];

const colors = new Uint8Array([
    255, 25, 12,
    0, 64, 255,
    25, 255, 42,
    255, 0, 255
]);

const FOOD_VERTEX_SIZE = 2 + 2 + 1; // x,y, u,v, c

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;
    buffer = gl.createBuffer()!;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_FOOD__,
        __FRAGMENTSHADER_FOOD__,
        ["aPosition", "aLocalPos", "aColorIndex"]
    );

    texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, colors.length/3, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, colors);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

export function render(foodChunks: Iterable<FoodChunk>, transform: Matrix) {
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shader.setUniform("uColorSampler", 0);

    for (const chunk of foodChunks) {
        shader.setUniform("uTransform", transform.data);
        const data = createGPUData(chunk.food);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
        shader.run(chunk.food.length * boxCoords.length, {
            stride: FOOD_VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT
        });
    }
}

let foodGPUData: Float32Array = new Float32Array(32 * boxCoords.length);

function createGPUData(foods: Food[]): Float32Array {
    const floatsPerFood = FOOD_VERTEX_SIZE * boxCoords.length;
    const n = foods.length * floatsPerFood;

    if (foodGPUData.length < n) {
        foodGPUData = new Float32Array(n);
    }

    for (let fi = 0; fi < foods.length; fi++) {
        const f = foods[fi];
        const offset = fi * floatsPerFood;
        const color = (f.color % 4) / 3;

        for (let bi = 0; bi < boxCoords.length; bi++) {
            const [u, v] = boxCoords[bi];

            // [x,y, u,v, c]
            foodGPUData[offset + FOOD_VERTEX_SIZE * bi + 0] = f.size * u + f.x;
            foodGPUData[offset + FOOD_VERTEX_SIZE * bi + 1] = f.size * v + f.y;

            foodGPUData[offset + FOOD_VERTEX_SIZE * bi + 2] = u;
            foodGPUData[offset + FOOD_VERTEX_SIZE * bi + 3] = v;

            foodGPUData[offset + FOOD_VERTEX_SIZE * bi + 4] = color;
        }
    }

    return foodGPUData;
}
