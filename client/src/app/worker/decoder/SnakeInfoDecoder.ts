import { GameConfig } from "../../data/config/GameConfig";
import { SnakeDTO } from "../../data/dto/SnakeDTO";
import { DecodeResult } from "./DecodeResult";

export const SNAKE_INFO_SIZE = 26;

export function decode(
    buffer: ArrayBuffer,
    offset: number,
    config: GameConfig
): DecodeResult<SnakeDTO> {
    const view = new DataView(buffer, offset, SNAKE_INFO_SIZE);

    if (__DEBUG__) {
        if (view.getUint8(5) > 1) {
            throw new Error(`Invalid Snake info buffer (${view.getUint8(3)})`);
        }
    }

    const length = view.getFloat32(6, false);
    const currentDirection = view.getFloat32(10, false);
    const targetDirection = view.getFloat32(14, false);

    const data: SnakeDTO = {
        id: view.getUint16(0, false),
        headChunkId: view.getUint32(0, false),
        skin: view.getUint8(4),
        fast: (view.getUint8(5) & 1) !== 0,
        length,
        width: computeWidthFromLength(length, config),
        headDirection: [currentDirection, targetDirection],
        headPosition: {
            x: view.getFloat32(18, false),
            y: view.getFloat32(22, false)
        }
    };

    return {
        data,
        nextByteOffset: offset + SNAKE_INFO_SIZE
    };
}

function computeWidthFromLength(
    length: number,
    config: GameConfig
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
