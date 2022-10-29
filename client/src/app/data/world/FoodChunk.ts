import * as BufferManager from "../../renderer/webgl/BufferManager";
import Rectangle from "../../math/Rectangle";
import * as SkinLoader from "../../renderer/SkinLoader";
import { FoodChunkDTO, FoodItemDTO } from "../dto/FoodChunkDTO";
import Camera from "../camera/Camera";
import * as FrameTime from "../../util/FrameTime";
import { ManagedObject } from "../../util/ManagedMap";

// TODO: move webgl stuff out of here
export default class FoodChunk implements ManagedObject<number, FoodChunkDTO> {
    static readonly INSTANCE_BYTE_SIZE =
        2 * Float32Array.BYTES_PER_ELEMENT + // x,y
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

    get length(): number {
        return this.#numFoodItems;
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
    const indicesPerItem = FoodChunk.INSTANCE_BYTE_SIZE / 4;

    if (gpuData === undefined || items.length * FoodChunk.INSTANCE_BYTE_SIZE) {
        gpuData = new ArrayBuffer(items.length * FoodChunk.INSTANCE_BYTE_SIZE);
    }

    const floatView = new Float32Array(gpuData);
    const intView = new Int32Array(gpuData);

    for (let fi = 0; fi < items.length; fi++) {
        const f = items[fi];
        const offset = indicesPerItem * fi;
        const color = SkinLoader.getColorPosition(f.color);

        floatView[offset + 0] = f.x;
        floatView[offset + 1] = f.y;
        intView[offset + 2] = color;
    }

    return gpuData;
}
