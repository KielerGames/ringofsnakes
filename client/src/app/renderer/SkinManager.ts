type Color = [number, number, number];

type Skin = {
    snakeBody: Color;
    food: Color;
};

const skins: Skin[] = [
    {
        // blue
        snakeBody: [128, 191, 255],
        food: [0, 128, 255]
    },
    {
        // orange
        snakeBody: [255, 184, 114],
        food: [255, 134, 14]
    },
    {
        // green
        snakeBody: [191, 255, 128],
        food: [25, 255, 42]
    },
    {
        // yellow
        snakeBody: [250, 255, 80],
        food: [255, 25, 12]
    },
    {
        // pink
        snakeBody: [230, 67, 197],
        food: [255, 0, 255]
    },
    {
        // red
        snakeBody: [255, 81, 55],
        food: [255, 25, 12]
    }
];

const skinData: Uint8Array = (() => {
    const data = new Uint8Array(2 * 4 * skins.length);

    skins.forEach((skin, index) => {
        const i1 = 4 * index;
        const i2 = data.length / 2 + i1;

        data[i1] = skin.snakeBody[0];
        data[i1 + 1] = skin.snakeBody[1];
        data[i1 + 2] = skin.snakeBody[2];
        data[i1 + 3] = 255;

        data[i2] = skin.food[0];
        data[i2 + 1] = skin.food[1];
        data[i2 + 2] = skin.food[2];
        data[i2 + 3] = 255;
    });

    return data;
})();

let gl: WebGLRenderingContext;
let texture: WebGLTexture;

export function init(glCtx: WebGLRenderingContext): void {
    gl = glCtx;

    texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    // I do not know why but for textures
    // with height > 1 RGB does not work
    const format = gl.RGBA;

    gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipmap level
        format,
        skins.length, // width
        2, // height
        0,
        format,
        gl.UNSIGNED_BYTE,
        skinData
    );
}

export function setSkinTexture(
    textureSlot: number = WebGLRenderingContext.TEXTURE0
): void {
    gl.activeTexture(textureSlot);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

export function getSnakeColor(skinId: number): Color {
    // @ts-ignore
    return skins[skinId % skins.length].snakeBody.map((v) => v / 255);
}
