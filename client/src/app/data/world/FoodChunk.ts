import type { Consumer } from "../../util/FunctionTypes";
import type { FoodChunkDTO } from "../dto/FoodChunkDTO";
import type Camera from "../camera/Camera";
import type { ManagedObject } from "../../util/ManagedMap";
import Rectangle from "../../math/Rectangle";
import * as FrameTime from "../../util/FrameTime";

export default class FoodChunk implements ManagedObject<number, FoodChunkDTO> {
    readonly id: number;
    readonly box: Rectangle;

    #vertexBuffer: ArrayBuffer | undefined;
    #numFoodItems: number;
    #lastUpdateTime: number;

    constructor(dto: FoodChunkDTO) {
        this.id = dto.id;
        this.box = Rectangle.fromTransferable(dto.bounds);
        this.update(dto);
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

    update(dto: FoodChunkDTO): void {
        this.#numFoodItems = dto.count;
        this.#vertexBuffer = dto.vertexBuffer;
        this.#lastUpdateTime = FrameTime.now();
    }

    destroy(): void {
        // TODO
    }

    isVisible(camera: Camera, eps: number = 0.0): boolean {
        return Rectangle.distance2(this.box, camera.viewBox) <= eps * eps;
    }

    /**
     * If this FoodChunk contains new vertex data move it to the consumer.
     */
    moveVertexData(consumer: Consumer<ArrayBuffer>): void {
        if (this.#vertexBuffer === undefined) {
            return;
        }

        const data = this.#vertexBuffer;
        this.#vertexBuffer = undefined;

        consumer(data);
    }
}
