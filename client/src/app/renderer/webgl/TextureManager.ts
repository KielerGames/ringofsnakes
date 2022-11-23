import assert from "../../util/assert";
import requireNonNull from "../../util/requireNonNull";
import * as WebGLContextProvider from "./WebGLContextProvider";

const textures: Map<number, WebGLTexture> = new Map();
const images: Map<string, Promise<HTMLImageElement>> = new Map();

export function initTexture(
    slot: number,
    options: Partial<TextureOptions>,
    initializer?: TextureInitializer
): WebGLTexture {
    assert(slot >= 0);
    const gl = WebGLContextProvider.getContext();

    if (textures.has(slot)) {
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

export function loadImage(url: string): Promise<HTMLImageElement>;
export function loadImage(url: string, size: number): Promise<HTMLImageElement>;
export function loadImage(url: string, width: number, height: number): Promise<HTMLImageElement>;
export async function loadImage(
    url: string,
    width?: number,
    height?: number
): Promise<HTMLImageElement> {
    if (width !== undefined && height === undefined) {
        height = width;
    }

    // Avoid fetching the same image twice.
    if (images.has(url)) {
        const image = await images.get(url)!;

        if (width !== undefined) {
            image.width = width;
        }
        if (height !== undefined) {
            image.height = height;
        }

        return image;
    }

    return await loadNewImage(url, width, height);
}

async function loadNewImage(url: string, width?: number, height?: number): Promise<HTMLImageElement> {
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image(width, height);
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });

    // Store the promise before it has finished loading so it can be reused immediately.
    images.set(url, promise);

    const image = await promise;
    return image;
}

type TextureOptions = {
    wrap: number;
    minFilter: number;
    magFilter: number;
};

type TextureInitializer = (gl: WebGL2RenderingContext, texture: WebGLTexture, slot: number) => void;
