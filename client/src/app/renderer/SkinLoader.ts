import WebGLShaderProgram from "./webgl/WebGLShaderProgram";
import * as Skins from "../data/misc/Skins";
import * as WebGLContextProvider from "./webgl/WebGLContextProvider";
import { rgb2rgbaf } from "../util/ColorUtils";
import * as TextureManager from "./webgl/TextureManager";

const skinTextureData: Uint8Array = (() => {
    const skins = Skins.getAllSkins();
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

export async function init(): Promise<void> {
    const gl = await WebGLContextProvider.waitForContext();

    TextureManager.initTexture(
        0,
        {
            wrap: gl.CLAMP_TO_EDGE,
            minFilter: gl.NEAREST,
            magFilter: gl.NEAREST
        },
        (gl) => {
            // I do not know why but for textures
            // with height > 1 RGB does not work
            const format = gl.RGBA;

            gl.texImage2D(
                gl.TEXTURE_2D,
                0, // mipmap level
                format,
                Skins.getAllSkins().length, // width
                2, // height
                0,
                format,
                gl.UNSIGNED_BYTE,
                skinTextureData
            );
        }
    );
}

export function setColor(shader: WebGLShaderProgram, uniform: string, skinId: number): void {
    shader.setUniform(uniform, getColorPosition(skinId));
}

export function getColorPosition(skinId: number): number {
    const skins = Skins.getAllSkins();
    return skinId % skins.length;
}

export function getFloatColor(skinId: number, alpha: number): [number, number, number, number] {
    return rgb2rgbaf(Skins.getSkin(skinId).snakeBody, alpha);
}
