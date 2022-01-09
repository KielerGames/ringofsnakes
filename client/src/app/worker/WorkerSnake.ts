import { config } from "chai";
import Vector from "../math/Vector";
import { GameConfig } from "../types/GameConfig";
import { SnakeInfo } from "./decoder/SnakeInfoDecoder";
import { SnakeDataDTO } from "./MainThreadGameDataUpdate";

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
        this.lastKnownSpeed = this.tickSpeed();
    }

    public updateFromServer(info: SnakeInfo): void {
        this.data = info;
        this.headPosition.set(info.position);
        this.correctOffset += this.tickSpeed();
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

    public get headSnakeChunkId(): number {
        return this.data.currentChunkId;
    }

    private tickSpeed(): number {
        const cfg = this.gameConfig;
        return this.fast ? cfg.snakes.fastSpeed : cfg.snakes.speed;
    }

    private speed(): number {
        return this.tickSpeed() / this.gameConfig.tickDuration;
    }

    public createTransferData(): SnakeDataDTO {
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
            offsetCorrection,
            headChunkId: this.headSnakeChunkId
        };
    }
}

function computeWidthFromLength(
    length: number,
    config: Readonly<GameConfig>
): number {
    const minWidth = config.snakes.minWidth;
    const maxWidthGain = config.snakes.maxWidth - config.snakes.minWidth;
    const LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH = 1024.0;

    const x =
        (length - config.snakes.minLength) /
        (LENGTH_FOR_95_PERCENT_OF_MAX_WIDTH - config.snakes.minLength);
    const gain = 2.0 * (sigmoid(3.66 * x) - 0.5);
    return minWidth + gain * maxWidthGain;
}

function sigmoid(x: number): number {
    return 1.0 / (1.0 + Math.exp(-x));
}
