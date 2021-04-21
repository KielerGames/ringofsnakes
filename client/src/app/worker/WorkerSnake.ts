import Vector from "../math/Vector";
import { GameConfig } from "../protocol";
import { SnakeInfo } from "./decoder/SnakeInfoDecoder";
import { SnakeData } from "./GameDataUpdate";

export default class WorkerSnake {
    public readonly id: number;

    private headPosition: Vector;
    private data: SnakeInfo;
    private offsetCorrection: number = 0.0;

    public constructor(info: SnakeInfo) {
        this.id = info.snakeId;
        this.headPosition = Vector.fromObject(info.position);
        this.data = info;
    }

    public updateFromServer(info: SnakeInfo): void {
        this.data = info;
        this.headPosition.set(info.position);
    }

    public get width(): number {
        return 0.5; //TODO
    }

    public get skin(): number {
        return this.data.skin;
    }

    public get position(): Vector {
        return this.headPosition;
    }

    public get length(): number {
        return this.data.length;
    }

    public get fast(): boolean {
        return this.data.fast;
    }

    public get direction(): number {
        return this.data.direction;
    }

    public getTransferData(cfg: GameConfig): SnakeData {
        return {
            id: this.id,
            length: this.length,
            skin: this.skin,
            position: this.position.createTransferable(),
            direction: this.direction,
            speed: this.fast ? cfg.fastSnakeSpeed : cfg.snakeSpeed,
        };
    }
}
