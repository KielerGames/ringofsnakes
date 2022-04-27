import AsyncEvent from "../../util/AsyncEvent";
import { loadJSON } from "../../util/JSONLoader";

type Filename = string;
type ShaderSource = string;
type JSONData = Record<Filename, ShaderSource>;

const shaders = new Map<Filename, ShaderSource>();
const loaded = new AsyncEvent();

(async () => {
    const filePath = "shaders.json?v=" + __VERSION__;
    const shaderData = await loadJSON<JSONData>(filePath, {
        guard: function (data: unknown): data is JSONData {
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
    });

    for (const [key, value] of Object.entries(shaderData)) {
        shaders.set(key, value);
    }

    loaded.set();
})();

/**
 * Load the shader code defined in src/shader/${filename}.
 * Does not load the file directly, shaders must be packed in public/shaders.json.
 */
export async function getShaderSource(filename: Filename): Promise<ShaderSource> {
    await loaded.wait();

    if (!shaders.has(filename)) {
        return Promise.reject(new Error(`Shader ${filename} not found.`));
    }

    return shaders.get(filename)!;
}
