import * as BufferManager from "../../renderer/webgl/BufferManager";
import Rectangle from "../../math/Rectangle";
import * as SkinLoader from "../../renderer/SkinLoader";
import { FoodChunkDTO, FoodItemDTO } from "../dto/FoodChunkDTO";
import Camera from "../camera/Camera";
import * as FrameTime from "../../util/FrameTime";
import { ManagedObject } from "../../util/ManagedMap";

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

// TODO: move webgl stuff out of here
export default class FoodChunk implements ManagedObject<number, FoodChunkDTO> {
    static readonly VERTEX_BYTE_SIZE =
        2 * Float32Array.BYTES_PER_ELEMENT + // x,y
        2 * Float32Array.BYTES_PER_ELEMENT + // u,v
        Int32Array.BYTES_PER_ELEMENT; // c

    readonly id: number;
    readonly box: Rectangle;

    #gpuBuffer: WebGLBuffer;
    #gpuData: ArrayBuffer | undefined;
    #numFoodItems: number;
    #lastUpdateTime: number;

    constructor(dto: FoodChunkDTO) {
        this.id = dto.id;
        this.box = Rectangle.fromTransferable(dto.bounds);
        this.#gpuBuffer = BufferManager.create();
        this.update(dto);
    }

    update(dto: FoodChunkDTO): void {
        this.#numFoodItems = dto.items.length;
        this.#gpuData = createGPUData(dto.items, this.#gpuData);
        this.#lastUpdateTime = FrameTime.now();
    }

    destroy(): void {
        BufferManager.free(this.#gpuBuffer);
    }

    useBuffer(gl: WebGL2RenderingContext): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#gpuBuffer);

        if (this.#gpuData) {
            gl.bufferData(gl.ARRAY_BUFFER, this.#gpuData, gl.STATIC_DRAW);
            this.#gpuData = undefined;
        }
    }

    isVisible(camera: Camera, eps: number = 0.0): boolean {
        return Rectangle.distance2(this.box, camera.viewBox) <= eps * eps;
    }

    get numberOfVertices(): number {
        return this.#numFoodItems * boxCoords.length;
    }

    /**
     * Time since this chunk was created or last updated.
     */
    get age(): number {
        return 0.001 * (FrameTime.now() - this.#lastUpdateTime);
    }
}

// TODO: consider moving to worker
function createGPUData(items: FoodItemDTO[], gpuData: ArrayBuffer | undefined): ArrayBuffer {
    const bytesPerFood = FoodChunk.VERTEX_BYTE_SIZE * boxCoords.length;
    const indicesPerFood = bytesPerFood / 4; // 32bit = 4 bytes
    const indicesPerVertex = FoodChunk.VERTEX_BYTE_SIZE / 4;

    if (gpuData === undefined || items.length * bytesPerFood) {
        gpuData = new ArrayBuffer(items.length * bytesPerFood);
    }

    const floatView = new Float32Array(gpuData);
    const intView = new Int32Array(gpuData);

    // Iterate over food items.
    for (let fi = 0; fi < items.length; fi++) {
        const f = items[fi];
        const offset = fi * indicesPerFood;
        const color = SkinLoader.getColorPosition(f.color);

        // Iterate over vertices of each food item.
        for (let bi = 0; bi < boxCoords.length; bi++) {
            const [u, v] = boxCoords[bi];
            const boxVertexOffset = offset + indicesPerVertex * bi;

            // absolute position [x,y]
            floatView[boxVertexOffset + 0] = f.x + f.size * u;
            floatView[boxVertexOffset + 1] = f.y + f.size * v;

            // relative position [u,v]
            floatView[boxVertexOffset + 2] = u;
            floatView[boxVertexOffset + 3] = v;

            // color
            intView[boxVertexOffset + 4] = color;
        }
    }

    return gpuData;
}
