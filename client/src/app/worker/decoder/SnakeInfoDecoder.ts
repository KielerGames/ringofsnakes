import { DecodeResult } from "./DecodeResult";

export const SNAKE_INFO_SIZE = 24;

export function decode(
    buffer: ArrayBuffer,
    offset: number
): DecodeResult<SnakeInfo> {
    const view = new DataView(buffer, offset, SNAKE_INFO_SIZE);

    if (view.getUint8(3) > 1) {
        throw new Error(`Invalid Snake info buffer (${view.getUint8(3)})`);
    }

    const data = {
        snakeId: view.getUint16(0, false),
        skin: view.getUint8(2),
        fast: view.getUint8(3) !== 0,
        length: view.getFloat32(4, false),
        direction: view.getFloat32(8, false),
        targetDirection: view.getFloat32(12, false),
        position: {
            x: view.getFloat32(16, false),
            y: view.getFloat32(20, false)
        }
    };

    return {
        data,
        nextByteOffset: offset + SNAKE_INFO_SIZE
    };
}

export type SnakeInfo = {
    snakeId: number;
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
