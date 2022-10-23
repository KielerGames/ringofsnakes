import { WebGLUniform, WebGLAttribute } from "./WebGLShaderVariable";
import type { ShaderVarValue } from "./WebGLShaderVariable";
import requireNonNull from "../../util/requireNonNull";

export default class WebGLShaderProgram {
    readonly #gl: WebGL2RenderingContext;
    readonly #program: WebGLProgram;
    readonly #uniforms: Map<string, WebGLUniform> = new Map();
    readonly #attribs: Map<string, WebGLAttribute> = new Map();
    readonly #vertexArray: WebGLVertexArrayObject;
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
            this.#attribs.set(info.name, new WebGLAttribute(info, location));
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

        this.#computeStride();

        // uniforms

        const numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < numberOfUniforms; i++) {
            const info = gl.getActiveUniform(program, i)!;
            const location = gl.getUniformLocation(program, info.name)!;
            this.#uniforms.set(info.name, new WebGLUniform(gl, info, location));
        }

        this.#vertexArray = requireNonNull(gl.createVertexArray());
    }

    /**
     * Must be called before calling run().
     */
    use(): void {
        const gl = this.#gl;
        gl.useProgram(this.#program);
        gl.bindVertexArray(this.#vertexArray);
    }

    run(
        numVertices: number,
        options?: {
            mode?: number;
            start?: number;
        }
    ): void {
        const gl = this.#gl;
        const stride = this.#autoStride;

        const { mode, start } = {
            mode: this.#gl.TRIANGLES,
            start: 0,
            ...options
        };

        let byteOffset = 0;
        for (const name of this.#attribOrder) {
            const attrib = this.#attribs.get(name)!; // TODO?
            if (attrib.value === null) {
                gl.enableVertexAttribArray(attrib.location);
                if (attrib.type === gl.INT) {
                    gl.vertexAttribIPointer(
                        attrib.location,
                        attrib.components,
                        gl.INT,
                        stride,
                        byteOffset
                    );
                } else {
                    gl.vertexAttribPointer(
                        attrib.location,
                        attrib.components,
                        gl.FLOAT,
                        false,
                        stride,
                        byteOffset
                    );
                }
                byteOffset += attrib.byteSize;
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
            uniform.apply();
        });

        gl.drawArrays(mode, start, numVertices);
    }

    /**
     * Set the attribute to a constant value or enable VertexAttribArray.
     * @param name attribute name
     * @param value use null to enable VertexAttribArray
     */
    setAttribute(name: string, value: ShaderVarValue | null): void {
        const attrib = this.#attribs.get(name);

        if (attrib === undefined) {
            throw new Error(`Attribute ${name} does not exist.`);
        }

        const stateChanged = (attrib.value === null) !== (value === null);
        attrib.value = value;
        if (stateChanged) {
            this.#computeStride();
        }
    }

    setUniform(name: string, value: ShaderVarValue): void {
        const uniform = this.#uniforms.get(name);

        if (__DEBUG__ && uniform === undefined) {
            throw new Error(`Uniform ${name} does not exist.`);
        }

        uniform!.value = value;
    }

    get stride(): number {
        return this.#autoStride;
    }

    #computeStride() {
        this.#autoStride = Array.from(this.#attribs.values())
            .filter((attrib) => attrib.value === null)
            .reduce((sum, attrib) => sum + attrib.byteSize, 0);
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
