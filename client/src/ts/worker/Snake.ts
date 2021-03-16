import Vector from "../math/Vector";
import { SnakeInfo } from "../protocol/main-worker";
import NonFinalChunk from "./NonFinalChunk";

export default class Snake {
    public readonly id:number;

    private chunks: NonFinalChunk[];
    private headPosition: Vector;

    public constructor(info: SnakeInfo) {
        this.id = info.snakeId;
        this.headPosition = Vector.fromObject(info.position);
    }
}
