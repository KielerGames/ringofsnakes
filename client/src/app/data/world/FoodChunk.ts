import * as BufferManager from "../../renderer/webgl/BufferManager";
import Rectangle from "../../math/Rectangle";
import { FoodChunkDTO } from "../dto/FoodChunkDTO";
import Camera from "../camera/Camera";
import * as FrameTime from "../../util/FrameTime";
import { ManagedObject } from "../../util/ManagedMap";

// TODO: move webgl stuff out of here
export default class FoodChunk implements ManagedObject<number, FoodChunkDTO> {
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
        this.#numFoodItems = dto.count;
        this.#gpuData = dto.vertexBuffer;
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
