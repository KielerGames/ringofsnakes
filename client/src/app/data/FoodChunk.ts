import { FoodChunkDTO, FoodItemDTO } from "../worker/decoder/FoodDecoder";
import * as BufferManager from "../webgl/BufferManager";

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
export default class FoodChunk {
    public static readonly FOOD_VERTEX_SIZE = 2 + 2 + 1; // x,y, u,v, c

    public id: number;
    private gpuBuffer: WebGLBuffer;
    private gpuData: Float32Array | undefined = new Float32Array(
        32 * boxCoords.length
    );
    private numFoodItems: number;

    public constructor(dto: FoodChunkDTO) {
        this.id = dto.id;
        this.numFoodItems = dto.items.length;
        this.gpuBuffer = BufferManager.create();
        this.gpuData = createGPUData(dto.items, this.gpuData);
    }

    public update(dto: FoodChunkDTO): void {
        this.numFoodItems = dto.items.length;
        this.gpuData = createGPUData(dto.items, this.gpuData);
    }

    public destroy(): void {
        BufferManager.free(this.gpuBuffer);
    }

    public useBuffer(gl: WebGLRenderingContext): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gpuBuffer);

        if (this.gpuData) {
            gl.bufferData(gl.ARRAY_BUFFER, this.gpuData, gl.STATIC_DRAW);
            this.gpuData = undefined;
        }
    }

    public get numberOfVertices(): number {
        return this.numFoodItems * boxCoords.length;
    }
}

function createGPUData(
    items: FoodItemDTO[],
    gpuData: Float32Array | undefined
): Float32Array {
    const floatsPerFood = FoodChunk.FOOD_VERTEX_SIZE * boxCoords.length;
    const n = items.length * floatsPerFood;
    const fvs = FoodChunk.FOOD_VERTEX_SIZE;

    if (gpuData === undefined || gpuData.length < n) {
        gpuData = new Float32Array(n);
    }

    for (let fi = 0; fi < items.length; fi++) {
        const f = items[fi];
        const offset = fi * floatsPerFood;
        const color = (f.color % 4) / 3;

        for (let bi = 0; bi < boxCoords.length; bi++) {
            const [u, v] = boxCoords[bi];

            // [x,y, u,v, c]
            gpuData[offset + fvs * bi + 0] = f.size * u + f.x;
            gpuData[offset + fvs * bi + 1] = f.size * v + f.y;

            gpuData[offset + fvs * bi + 2] = u;
            gpuData[offset + fvs * bi + 3] = v;

            gpuData[offset + fvs * bi + 4] = color;
        }
    }

    return gpuData;
}
