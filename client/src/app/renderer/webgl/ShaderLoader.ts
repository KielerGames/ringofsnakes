import { dialog } from "../../ui/Dialogs";
import AsyncEvent from "../../util/AsyncEvent";
import WebGLShaderProgram from "./WebGLShaderProgram";
import * as WebGLContextProvider from "./WebGLContextProvider";
import * as ResourceLoader from "../../ResourceLoader";

type Filename = string;
type ShaderSource = string;
type JSONData = Record<Filename, ShaderSource>;

const shaders = new Map<Filename, ShaderSource>();
const loaded = new AsyncEvent();

(async () => {
    const filePath = "shaders.json?h=" + __SHADER_HASH__;
    const shaderData = await ResourceLoader.MAIN.loadJSON<JSONData>(
        filePath,
        (data: unknown): data is JSONData => {
            if (typeof data !== "object") {
                return false;
            }

            for (const [key, value] of Object.entries(data!)) {
                if (typeof key !== "string" || typeof value !== "string") {
                    return false;
                }

                if (__DEBUG__) {
                    if (!/[A-Za-z_]\w+\.(vert|frag)/.test(key)) {
                        return false;
                    }

                    if (value.trim() === "") {
                        return false;
                    }
                }
            }

            return true;
        }
    );

    for (const [key, value] of Object.entries(shaderData)) {
        shaders.set(key, value);
    }

    loaded.set();
})();

/**
 * Load the shader code defined in src/shader/${filename}.
 * Does not load the file directly, shaders must be packed in public/shaders.json.
 */
async function getShaderSource(filename: Filename): Promise<ShaderSource> {
    await loaded.wait();

    if (!shaders.has(filename)) {
        return Promise.reject(new Error(`Shader ${filename} not found.`));
    }

    return shaders.get(filename)!;
}

/**
 * Compiles the shader using the code defined in
 *  - src/shader/${name}.vert (vertex shader)
 *  - src/shader/${name}.frag (fragment shader)
 */
export async function compileShader(
    name: string,
    attribOrder?: string[]
): Promise<WebGLShaderProgram> {
    const vertexShader = await getShaderSource(name + ".vert");
    const fragmentShader = await getShaderSource(name + ".frag");
    const gl = await WebGLContextProvider.waitForContext();

    try {
        return new WebGLShaderProgram(gl, vertexShader, fragmentShader, attribOrder);
    } catch (e) {
        console.error(e);
        await dialog({
            title: "Error",
            content: `Failed to compile shader "${name}".`
        });
        return Promise.reject(e);
    }
}
