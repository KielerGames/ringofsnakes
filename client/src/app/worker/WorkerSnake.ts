import Vector from "../math/Vector";
import { GameConfig } from "../protocol";
import { SnakeInfo } from "./decoder/SnakeInfoDecoder";
import { SnakeData } from "./GameDataUpdate";

export default class WorkerSnake {
    public readonly id: number;

    private headPosition: Vector;
    private data: SnakeInfo;
    private lastKnownSpeed: number = 0.0;
    private offsetPrediction: number = 0.0;
    private correctOffset: number = 0.0;

    public constructor(info: SnakeInfo, cfg: GameConfig) {
        this.id = info.snakeId;
        this.headPosition = Vector.fromObject(info.position);
        this.data = info;
        this.lastKnownSpeed = this.speed(cfg);
    }

    public updateFromServer(info: SnakeInfo, cfg: GameConfig): void {
        this.data = info;
        this.headPosition.set(info.position);
        this.correctOffset += this.speed(cfg);
        this.offsetPrediction += this.lastKnownSpeed;
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

    private speed(cfg: GameConfig): number {
        return this.fast ? cfg.fastSnakeSpeed : cfg.snakeSpeed;
    }

    public createTransferData(cfg: GameConfig): SnakeData {
        const currentSpeed = this.speed(cfg);
        // correction for the main thread prediction
        const offsetCorrection = this.correctOffset - this.offsetPrediction;
        // reset for next correction
        this.lastKnownSpeed = currentSpeed;
        this.offsetPrediction = 0.0;
        this.correctOffset = 0.0;

        return {
            id: this.id,
            length: this.length,
            skin: this.skin,
            position: this.position.createTransferable(),
            direction: this.direction,
            speed: currentSpeed,
            offsetCorrection
        };
    }
}
