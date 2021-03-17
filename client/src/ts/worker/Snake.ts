import Vector from "../math/Vector";
import { SnakeInfo } from "../protocol/main-worker";
import WorkerChunk from "./WorkerChunk";

export default class Snake {
    public readonly id:number;

    private chunks: WorkerChunk[];
    private headPosition: Vector;

    public constructor(info: SnakeInfo) {
        this.id = info.snakeId;
        this.headPosition = Vector.fromObject(info.position);
    }

    public get width():number {
        return 0.5; //TODO
    }
}
