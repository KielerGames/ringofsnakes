/* eslint-disable max-classes-per-file */

type ShaderVarValue = number | number[] | Float32Array;
type WebGLAttributeLocation = number;

export default class WebGLShaderProgram {
    readonly #gl: WebGL2RenderingContext;
    readonly #program: WebGLProgram;
    readonly #uniforms: Map<string, ShaderVar<WebGLUniformLocation>> = new Map();
    readonly #attribs: Map<string, ShaderVar<WebGLAttributeLocation>> = new Map();
    #attribOrder: string[];
    #autoStride: number = 0;

    constructor(
        gl: WebGL2RenderingContext,
        vertex: string,
        fragment: string,
        vertexBufferLayout?: string[]
    ) {
        this.#gl = gl;

        // compile & link shader program
        const vs = compileShader(gl, gl.VERTEX_SHADER, vertex);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);

        const program: WebGLProgram = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        // check for errors
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Shader linking failed: " + gl.getProgramInfoLog(program));
        }

        if (__DEBUG__) {
            gl.validateProgram(program);

            if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                console.error("WebGL program info log", gl.getProgramInfoLog(program));
                throw new Error("Shader program validation failed.");
            }
        }

        this.#program = program;

        // get shader attributes & uniforms
        // attributes & uniforms are "active" after linking
        const numberOfAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        const attribOrder = [];

        for (let i = 0; i < numberOfAttributes; i++) {
            const info = gl.getActiveAttrib(program, i)!;
            const location = gl.getAttribLocation(program, info.name);
            this.#attribs.set(info.name, new ShaderVar(info, location));
            attribOrder.push(info.name);
        }

        if (vertexBufferLayout !== undefined) {
            if (__DEBUG__) {
                // validate custom vertex buffer layout

                if (vertexBufferLayout.length === 0) {
                    throw new Error("Custom buffer layout may not be empty.");
                }

                for (const attribName of vertexBufferLayout) {
                    if (!this.#attribs.has(attribName)) {
                        throw new Error(
                            `Attribute "${attribName}" not found. Unused attributes get removed by the compiler.`
                        );
                    }
                }
            }

            this.#attribOrder = [...vertexBufferLayout];
        } else {
            this.#attribOrder = attribOrder;
        }

        this.computeStride();

        // uniforms

        const numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < numberOfUniforms; i++) {
            const info = gl.getActiveUniform(program, i)!;
            const location = gl.getUniformLocation(program, info.name)!;
            this.#uniforms.set(info.name, new ShaderVar(info, location));
        }
    }

    private computeStride() {
        const sum = Array.from(this.#attribs.values())
            .filter((attrib) => attrib.value === null)
            .reduce((s, attrib) => s + attrib.size, 0);
        this.#autoStride = sum * Float32Array.BYTES_PER_ELEMENT;
    }

    public use(): void {
        this.#gl.useProgram(this.#program);
    }

    public run(
        numVertices: number,
        options?: {
            mode?: number;
            start?: number;
            stride?: number;
        }
    ): void {
        const gl = this.#gl;

        const { mode, start, stride } = {
            mode: this.#gl.TRIANGLES,
            start: 0,
            stride: this.#autoStride,
            ...options
        };

        let offset = 0;
        for (const name of this.#attribOrder) {
            const attrib = this.#attribs.get(name)!; // TODO?
            if (attrib.value === null) {
                gl.enableVertexAttribArray(attrib.location);
                if (attrib.type === gl.INT) {
                    gl.vertexAttribIPointer(
                        attrib.location,
                        attrib.size,
                        gl.INT,
                        stride,
                        offset * Int32Array.BYTES_PER_ELEMENT
                    );
                } else {
                    gl.vertexAttribPointer(
                        attrib.location,
                        attrib.size,
                        gl.FLOAT,
                        false,
                        stride,
                        offset * Float32Array.BYTES_PER_ELEMENT
                    );
                }
                offset += attrib.size;
            } else {
                // eslint-disable-next-line no-lonely-if
                if (attrib.type === gl.FLOAT) {
                    gl.vertexAttrib1f(attrib.location, attrib.value as number);
                } else {
                    // TODO
                    // gl.vertexAttrib[1234]f[v]()
                    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttrib
                    throw new Error("Constant values for attributes not yet implemented!");
                }
            }
        }

        this.#uniforms.forEach((uniform) => {
            if (uniform.value !== null) {
                if (uniform.type === gl.FLOAT) {
                    gl.uniform1f(uniform.location, uniform.value as number);
                } else if (uniform.type === gl.SAMPLER_2D) {
                    gl.uniform1i(uniform.location, uniform.value as number);
                } else if (uniform.type === gl.FLOAT_VEC2) {
                    gl.uniform2fv(uniform.location, uniform.value as number[]);
                } else if (uniform.type === gl.FLOAT_VEC3) {
                    gl.uniform3fv(uniform.location, uniform.value as number[]);
                } else if (uniform.type === gl.FLOAT_VEC4) {
                    gl.uniform4fv(uniform.location, uniform.value as number[]);
                } else if (uniform.type === gl.FLOAT_MAT3) {
                    gl.uniformMatrix3fv(uniform.location, false, uniform.value as number[]);
                } else if (uniform.type === gl.FLOAT_MAT4) {
                    gl.uniformMatrix4fv(uniform.location, false, uniform.value as number[]);
                } else if (uniform.type === gl.INT) {
                    gl.uniform1i(uniform.location, uniform.value as number);
                } else {
                    throw new Error(`Uniform type ${uniform.type} not implemented.`);
                }
            }
        });

        gl.drawArrays(mode, start, numVertices);
    }

    public get context() {
        return this.#gl;
    }

    /**
     * Set the attribute to a constant value or enable VertexAttribArray.
     * @param name attribute name
     * @param value use null to enable VertexAttribArray
     */
    public setAttribute(name: string, value: ShaderVarValue | null): void {
        const attrib = this.#attribs.get(name);

        if (attrib === undefined) {
            throw new Error(`Attribute ${name} does not exist.`);
        }

        const stateChanged = (attrib.value === null) !== (value === null);
        attrib.value = value;
        if (stateChanged) {
            this.computeStride();
        }
    }

    public setUniform(name: string, value: ShaderVarValue): void {
        const uniform = this.#uniforms.get(name);

        if (uniform === undefined) {
            throw new Error(`Uniform ${name} does not exist.`);
        }

        uniform.value = value;
    }
}

class ShaderVar<L> {
    readonly name: string;
    readonly type: number;
    readonly location: L;
    readonly size: number;
    value: ShaderVarValue | null = null;

    constructor(info: WebGLActiveInfo, location: L) {
        this.name = info.name;
        this.type = info.type;
        if (!SIZES.has(info.type)) {
            throw new Error(`Size for type ${info.type} not known.`);
        }
        this.size = SIZES.get(info.type)! * info.size;
        this.location = location;
    }
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader: WebGLShader = gl.createShader(type)!;

    // set the source code
    gl.shaderSource(shader, source);

    // compile the shader program
    gl.compileShader(shader);

    // see if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Shader compile error " + gl.getShaderInfoLog(shader));
    }

    return shader;
}

const SIZES = new Map([
    [WebGL2RenderingContext.FLOAT, 1],
    [WebGL2RenderingContext.FLOAT_VEC2, 2],
    [WebGL2RenderingContext.FLOAT_VEC3, 3],
    [WebGL2RenderingContext.FLOAT_VEC4, 4],
    [WebGL2RenderingContext.FLOAT_MAT3, 3 * 3],
    [WebGL2RenderingContext.FLOAT_MAT4, 4 * 4],
    [WebGL2RenderingContext.INT, 1],
    [WebGL2RenderingContext.SAMPLER_2D, 1]
]);
