import { SnakeInfo } from "../../protocol/main-worker";

export const SNAKE_INFO_SIZE = 20;

export function decode(buffer: ArrayBuffer, offset: number = 0): SnakeInfo {
    const view = new DataView(buffer, offset, SNAKE_INFO_SIZE);

    if(view.getUint8(3) > 1) {
        throw new Error(`Invalid Snake info buffer (${view.getUint8(3)})`);
    }

    return {
        snakeId: view.getUint16(0, false),
        skin: view.getUint8(2),
        fast: view.getUint8(3) !== 0,
        length: view.getFloat32(4, false),
        direction: view.getFloat32(8, false),
        position: {
            x: view.getFloat32(12, false),
            y: view.getFloat32(16, false),
        },
    };
}

export function decodeN(
    n: number,
    buffer: ArrayBuffer,
    offset: number = 0
): SnakeInfo[] {
    let data: SnakeInfo[] = new Array(n);

    for (let i = 0; i < n; i++) {
        data[i] = decode(buffer, offset + i * SNAKE_INFO_SIZE);
    }

    return data;
}
