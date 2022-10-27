/* eslint-disable max-classes-per-file */

import type { Consumer } from "../../util/FunctionTypes";
type WebGLAttributeLocation = number;
export type ShaderVarValue = number | number[] | Float32Array;

const GL2 = WebGL2RenderingContext;

abstract class ShaderVar<Location> {
    static readonly #NUM_COMPONENTS = new Map([
        [GL2.FLOAT, 1],
        [GL2.FLOAT_VEC2, 2],
        [GL2.FLOAT_VEC3, 3],
        [GL2.FLOAT_VEC4, 4],
        [GL2.FLOAT_MAT3, 3 * 3],
        [GL2.FLOAT_MAT4, 4 * 4],
        [GL2.INT, 1],
        [GL2.SAMPLER_2D, 1]
    ]);

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
    static readonly #methods =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Map<number, any>([
            [GL2.FLOAT, GL2.prototype.uniform1f],
            [GL2.SAMPLER_2D, GL2.prototype.uniform1i],
            [GL2.FLOAT_VEC2, GL2.prototype.uniform2fv],
            [GL2.FLOAT_VEC3, GL2.prototype.uniform3fv],
            [GL2.FLOAT_VEC4, GL2.prototype.uniform4fv],
            [GL2.INT, GL2.prototype.uniform1i],
            [GL2.UNSIGNED_INT, GL2.prototype.uniform1ui]
        ]);

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
