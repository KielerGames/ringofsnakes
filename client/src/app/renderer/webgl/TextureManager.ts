import assert from "../../util/assert";
import requireNonNull from "../../util/requireNonNull";
import * as WebGLContextProvider from "./WebGLContextProvider";

const textures: Map<number, WebGLTexture> = new Map();

export async function initTextureSlot(
    slot: number,
    options: Partial<TextureOptions>,
    initializer?: TextureInitializer
): Promise<TextureInfo> {
    assert(slot >= 0);
    const gl = WebGLContextProvider.getContext();

    if (textures.has(slot)) {
        throw new Error(`Texture slot ${slot} is already occupied.`);
    }

    const texture = requireNonNull(gl.createTexture(), `Failed to create texture ${slot}.`);
    textures.set(slot, texture);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (options.wrap) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);
    }
    if (options.minFilter) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter);
    }
    if (options.magFilter) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter);
    }

    if (initializer) {
        await initializer(gl, texture, slot);
    }

    gl.activeTexture(WebGL2RenderingContext.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    return {
        slot,
        texture
    };
}

export function bindAllTextures(): void {
    // TODO: why is this required
    const gl = WebGLContextProvider.getContext();

    for (const [slot, texture] of textures.entries()) {
        gl.activeTexture(WebGL2RenderingContext.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }
}

export function loadImage(url: string, width?: number, height?: number): Promise<HTMLImageElement> {
    const image = new Image(width, height);
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

type TextureOptions = {
    wrap: number;
    minFilter: number;
    magFilter: number;
};

type TextureInfo = {
    slot: number;
    texture: WebGLTexture;
};

type TextureInitializer = (
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    slot: number
) => Promise<void> | void;
