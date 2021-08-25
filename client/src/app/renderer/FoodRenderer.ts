import FoodChunk, { Food } from "../data/FoodChunk";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let buffer: WebGLBuffer;
let shader: WebGLShaderProgram;

const boxCoords = new Float32Array([
    // triangle 1
    -1.0,  1.0, // top-left
     1.0,  1.0, // top-right
    -1.0, -1.0, // bottom-left
    // triangle 2
    -1.0, -1.0, // bottom-left
     1.0,  1.0, // top-right
     1.0, -1.0  // bottom-right
]);

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;
    buffer = gl.createBuffer()!;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_FOOD__,
        __FRAGMENTSHADER_FOOD__
    );
}

export function render(transform: Matrix, foodChunk: FoodChunk) {
    shader.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const data = createGPUData(foodChunk.food);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    //TODO
}

let foodGPUData: Float32Array = new Float32Array(16 * boxCoords.length);

function createGPUData(foods: Food[]): Float32Array {
    const n = foods.length * 2 * boxCoords.length;

    if(foodGPUData.length < n) {
        foodGPUData = new Float32Array(n);
    }

    for(let i=0; i<foods.length; i++) {
        const { x, y } = foods[i];
        const offset = i * 2 * boxCoords.length;
        // TODO
    } 

    return foodGPUData;
}
