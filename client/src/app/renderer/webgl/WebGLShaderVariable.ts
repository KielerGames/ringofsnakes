/* eslint-disable max-classes-per-file */

import { Consumer } from "../../util/FunctionTypes";

type WebGLAttributeLocation = number;

export type ShaderVarValue = number | number[] | Float32Array;

abstract class ShaderVar<Location> {
    static readonly #NUM_COMPONENTS = ((gl) =>
        new Map([
            [gl.FLOAT, 1],
            [gl.FLOAT_VEC2, 2],
            [gl.FLOAT_VEC3, 3],
            [gl.FLOAT_VEC4, 4],
            [gl.FLOAT_MAT3, 3 * 3],
            [gl.FLOAT_MAT4, 4 * 4],
            [gl.INT, 1],
            [gl.SAMPLER_2D, 1]
        ]))(WebGL2RenderingContext);

    readonly name: string;
    readonly type: number;
    readonly location: Location;
    readonly components: number;

    value: ShaderVarValue | null = null;

    constructor(info: WebGLActiveInfo, location: Location) {
        this.name = info.name;
        this.type = info.type;
        if (!ShaderVar.#NUM_COMPONENTS.has(info.type)) {
            throw new Error(`Type ${info.type} not implemented.`);
        }
        this.components = ShaderVar.#NUM_COMPONENTS.get(info.type)! * info.size;
        this.location = location;
    }
}

export class WebGLUniform extends ShaderVar<WebGLUniformLocation> {
    static readonly #methods = ((gl) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Map<number, any>([
            [gl.FLOAT, gl.prototype.uniform1f],
            [gl.SAMPLER_2D, gl.prototype.uniform1i],
            [gl.FLOAT_VEC2, gl.prototype.uniform2fv],
            [gl.FLOAT_VEC3, gl.prototype.uniform3fv],
            [gl.FLOAT_VEC4, gl.prototype.uniform4fv],
            [gl.INT, gl.prototype.uniform1i],
            [gl.UNSIGNED_INT, gl.prototype.uniform1ui]
        ]))(WebGL2RenderingContext);

    readonly #uniformSetter: Consumer<number> | Consumer<number[]> | Consumer<Float32Array>;

    constructor(gl: WebGL2RenderingContext, info: WebGLActiveInfo, location: WebGLUniformLocation) {
        super(info, location);
        if (info.type === gl.FLOAT_MAT3) {
            this.#uniformSetter = (v: number[]) => gl.uniformMatrix3fv(location, false, v);
        } else if (info.type === gl.FLOAT_MAT4) {
            this.#uniformSetter = (v: number[]) => gl.uniformMatrix4fv(location, false, v);
        } else {
            const method = WebGLUniform.#methods.get(info.type);
            if (method === undefined) {
                throw new Error(`Uniform type ${info.type} (${info.name}) not implemented.`);
            }
            this.#uniformSetter = (v: number | number[]) => method.call(gl, location, v);
        }
    }

    apply(): void {
        if (this.value === null) {
            return; // TODO
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.#uniformSetter(this.value as any);
    }
}

export class WebGLAttribute extends ShaderVar<WebGLAttributeLocation> {
    readonly byteSize: number;

    constructor(info: WebGLActiveInfo, location: WebGLAttributeLocation) {
        super(info, location);
        if (info.type === WebGL2RenderingContext.SAMPLER_2D) {
            throw new Error(); // TODO
        }
        // A component is usually a 32bit float or 32bit integer:
        this.byteSize = 4 * this.components;
    }
}
