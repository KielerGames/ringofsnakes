import Vector from "../math/Vector";
import { GameConfig } from "../types/GameConfig";
import { SnakeInfo } from "./decoder/SnakeInfoDecoder";
import { SnakeData } from "./GameDataUpdate";
import WorkerSnakeChunk from "./WorkerSnakeChunk";

export default class WorkerSnake {
    public readonly id: number;

    private headPosition: Vector;
    private data: SnakeInfo;
    private lastKnownSpeed: number = 0.0;
    private offsetPrediction: number = 0.0;
    private correctOffset: number = 0.0;
    private gameConfig: Readonly<GameConfig>;

    public constructor(info: SnakeInfo, cfg: Readonly<GameConfig>) {
        this.id = info.snakeId;
        this.gameConfig = cfg;
        this.headPosition = Vector.fromObject(info.position);
        this.data = info;
        this.lastKnownSpeed = this.speed();
    }

    public updateFromServer(info: SnakeInfo): void {
        this.data = info;
        this.headPosition.set(info.position);
        this.correctOffset += this.speed();
        this.offsetPrediction += this.lastKnownSpeed;
    }

    public get width(): number {
        return computeWidthFromLength(this.data.length, this.gameConfig);
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

    public get currentSnakeChunkId(): number {
        return this.data.currentChunkId;
    }

    private speed(): number {
        const cfg = this.gameConfig;
        return this.fast ? cfg.fastSnakeSpeed : cfg.snakeSpeed;
    }

    public createTransferData(): SnakeData {
        const currentSpeed = this.speed();
        // correction for the main thread prediction
        const offsetCorrection = this.correctOffset - this.offsetPrediction;
        // reset for next correction
        this.lastKnownSpeed = currentSpeed;
        this.offsetPrediction = 0.0;
        this.correctOffset = 0.0;

        return {
            id: this.id,
            length: this.length,
            width: this.width,
            skin: this.skin,
            position: this.position.createTransferable(),
            direction: this.direction,
            targetDirection: this.data.targetDirection,
            speed: currentSpeed,
            offsetCorrection
        };
    }
}

function computeWidthFromLength(
    length: number,
    config: Readonly<GameConfig>
): number {
    const minWidth = 0.5;
    const maxWidthGain = 4.0;
    const LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 700.0;
    const denominator = 1.0 / LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH;

    const x = 3.0 * (length - config.minLength) * denominator;
    const sigmoid = 1.0 / (1.0 + Math.exp(-x)) - 0.5;
    return 2.0 * (minWidth + sigmoid * maxWidthGain);
}
