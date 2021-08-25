import FoodChunk, { Food } from "../data/FoodChunk";
import Matrix from "../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";

declare const __VERTEXSHADER_FOOD__: string;
declare const __FRAGMENTSHADER_FOOD__: string;

let gl: WebGLRenderingContext;
let buffer: WebGLBuffer;
let shader: WebGLShaderProgram;

const boxCoords = [
    // triangle 1
    [-1.0,  1.0], // top-left
    [ 1.0,  1.0], // top-right
    [-1.0, -1.0], // bottom-left
    // triangle 2
    [-1.0, -1.0], // bottom-left
    [ 1.0,  1.0], // top-right
    [ 1.0, -1.0]  // bottom-right
];

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;
    buffer = gl.createBuffer()!;

    shader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_FOOD__,
        __FRAGMENTSHADER_FOOD__
    );
}

export function render(foodChunk: FoodChunk, transform: Matrix) {
    shader.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const data = createGPUData(foodChunk.food);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    //TODO
}

let foodGPUData: Float32Array = new Float32Array(32 * boxCoords.length);

function createGPUData(foods: Food[]): Float32Array {
    const m = 2 * boxCoords.length;
    const n = foods.length * 2 * m;

    if(foodGPUData.length < n) {
        foodGPUData = new Float32Array(n);
    }

    for(let fi=0; fi<foods.length; fi++) {
        const f = foods[fi];
        const offset = fi * 2 * m;
        
        for(let bi=0; bi<boxCoords.length; bi++) {     
            const [u, v] = boxCoords[bi];

            // [x,y,u,v]
            foodGPUData[offset + 4 * bi + 0] = f.size * u + f.x;
            foodGPUData[offset + 4 * bi + 1] = f.size * v + f.y;
            foodGPUData[offset + 4 * bi + 2] = u;
            foodGPUData[offset + 4 * bi + 3] = v;
        }
    } 

    return foodGPUData;
}
