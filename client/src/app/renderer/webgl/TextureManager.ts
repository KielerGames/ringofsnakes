import assert from "../../util/assert";
import requireNonNull from "../../util/requireNonNull";
import * as WebGLContextProvider from "./WebGLContextProvider";

const textures: Map<number, WebGLTexture> = new Map();

export function initTexture(
    slot: number,
    options: Partial<TextureOptions>,
    initializer?: TextureInitializer
): WebGLTexture {
    assert(slot >= 0);
    const gl = WebGLContextProvider.getContext();

    if (__DEBUG__ && textures.has(slot)) {
        throw new Error(`Texture slot ${slot} is already occupied.`);
    }

    const texture = requireNonNull(gl.createTexture(), `Failed to create texture ${slot}.`);
    textures.set(slot, texture);

    gl.activeTexture(WebGL2RenderingContext.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    if (options.wrap !== undefined) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);
    }
    if (options.minFilter !== undefined) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter);
    }
    if (options.magFilter !== undefined) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter);
    }

    if (initializer) {
        initializer(gl, texture, slot);
    }

    return texture;
}

type TextureOptions = {
    wrap: number;
    minFilter: number;
    magFilter: number;
};

type TextureInitializer = (gl: WebGL2RenderingContext, texture: WebGLTexture, slot: number) => void;
