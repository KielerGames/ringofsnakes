import { DecodeResult } from "./DecodeResult";

export const SNAKE_INFO_SIZE = 26;

export function decode(
    buffer: ArrayBuffer,
    offset: number
): DecodeResult<SnakeInfo> {
    const view = new DataView(buffer, offset, SNAKE_INFO_SIZE);

    if (__DEBUG__) {
        if (view.getUint8(5) > 1) {
            throw new Error(`Invalid Snake info buffer (${view.getUint8(3)})`);
        }
    }

    const data = {
        snakeId: view.getUint16(0, false),
        currentChunkId: view.getUint32(0, false),
        skin: view.getUint8(4),
        fast: view.getUint8(5) !== 0,
        length: view.getFloat32(6, false),
        direction: view.getFloat32(10, false),
        targetDirection: view.getFloat32(14, false),
        position: {
            x: view.getFloat32(18, false),
            y: view.getFloat32(22, false)
        }
    };

    return {
        data,
        nextByteOffset: offset + SNAKE_INFO_SIZE
    };
}

export type SnakeInfo = {
    snakeId: number;
    currentChunkId: number;
    skin: number;
    fast: boolean;
    length: number;
    direction: number;
    targetDirection: number;
    position: {
        x: number;
        y: number;
    };
};
