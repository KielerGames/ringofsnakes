import Vector from "../math/Vector";
import { SnakeInfo } from "./decoder/SnakeInfoDecoder";
import WorkerChunk from "./WorkerChunk";

export default class WorkerSnake {
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

    public update(info: SnakeInfo):void {
        
    }
}
