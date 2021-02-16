type SnakeInfo = {
    snakeId: number;
    skin: number;
    fast: boolean;
    length: number;
    direction: number;
    position: {
        x: number;
        y: number;
    };
};

const SNAKE_INFO_SIZE = 20;

export function decode(buffer: ArrayBuffer): SnakeInfo {
    const view = new DataView(buffer);

    if (buffer.byteLength !== SNAKE_INFO_SIZE) {
        throw new Error(`Invalid snake info buffer size: ${buffer.byteLength}`);
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
