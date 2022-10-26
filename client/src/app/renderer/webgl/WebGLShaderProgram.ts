import { WebGLUniform, WebGLAttribute } from "./WebGLShaderVariable";
import type { ShaderVarValue } from "./WebGLShaderVariable";
import requireNonNull from "../../util/requireNonNull";
import assert from "../../util/assert";

export default class WebGLShaderProgram {
    readonly #gl: WebGL2RenderingContext;
    readonly #program: WebGLProgram;
    readonly #uniforms: Map<string, WebGLUniform> = new Map();
    readonly #attribs: Map<string, WebGLAttribute> = new Map();
    #stride: number = 0;
    #vertexArray: WebGLVertexArrayObject | null = null;
    #attribOrder: string[];

    constructor(
        gl: WebGL2RenderingContext,
        vertex: string,
        fragment: string,
        vertexBufferLayout?: string[]
    ) {
        this.#gl = gl;
        this.#program = compile(gl, vertex, fragment);
        this.#findAttributes(vertexBufferLayout);
        this.#stride = this.#computeAttributeStride();
        this.#findUniforms();
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

        const { mode, start } = {
            mode: this.#gl.TRIANGLES,
            start: 0,
            ...options
        };

        if (this.#vertexArray === null) {
            this.#initializeVertexAttributes();
        }

        this.#uniforms.forEach((uniform) => {
            uniform.apply();
        });

        gl.drawArrays(mode, start, numVertices);
    }

    /**
     * This program will only use a single vertex buffer.
     * Allows internal use of vertex array objects.
     */
    setFixedBuffer(data: ArrayBuffer): void {
        const gl = this.#gl;

        assert(this.#vertexArray === null);

        this.#vertexArray = requireNonNull(gl.createVertexArray());
        this.use();

        const buffer = requireNonNull(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        // send data to GPU (once)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        this.#initializeVertexAttributes();
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
            this.#stride = this.#computeAttributeStride();
        }
    }

    setUniform(name: string, value: ShaderVarValue): void {
        const uniform = this.#uniforms.get(name);

        if (__DEBUG__ && uniform === undefined) {
            throw new Error(`Uniform ${name} does not exist.`);
        }

        uniform!.value = value;
    }

    get attributeStride(): number {
        return this.#stride;
    }

    #findAttributes(vertexBufferLayout?: string[]): void {
        const gl = this.#gl;

        // attributes are "active" after linking
        const numberOfAttributes = gl.getProgramParameter(this.#program, gl.ACTIVE_ATTRIBUTES);

        const attribOrder = [];

        for (let i = 0; i < numberOfAttributes; i++) {
            const info = gl.getActiveAttrib(this.#program, i)!;
            const location = gl.getAttribLocation(this.#program, info.name);
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
    }

    #findUniforms(): void {
        const gl = this.#gl;

        // uniforms are "active" after linking
        const numberOfUniforms = gl.getProgramParameter(this.#program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < numberOfUniforms; i++) {
            const info = gl.getActiveUniform(this.#program, i)!;
            const location = gl.getUniformLocation(this.#program, info.name)!;
            this.#uniforms.set(info.name, new WebGLUniform(gl, info, location));
        }
    }

    #computeAttributeStride(): number {
        return Array.from(this.#attribs.values())
            .filter((attrib) => attrib.value === null)
            .reduce((sum, attrib) => sum + attrib.byteSize, 0);
    }

    #initializeVertexAttributes(): void {
        const gl = this.#gl;
        const stride = this.#stride;

        let byteOffset = 0;
        for (const name of this.#attribOrder) {
            const attrib = this.#attribs.get(name)!; // TODO: verify in setter
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
                if (__DEBUG__ && this.#vertexArray !== null) {
                    throw new Error("Unsupported operation.");
                }
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
    }
}

/**
 * Compile and link vertex and fragment shader into a single program.
 * @param gl WebGL2 context (obtained from canvas)
 * @param vertex Vertex shader source code.
 * @param fragment Fragment shader source code.
 * @returns Compiled and linked WebGLProgram
 */
function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram {
    /**
     * Compiles a vertex or fragment shader.
     */
    function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
        const shader: WebGLShader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // check if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error("Shader compile error " + gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    // compile & link shader program
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertex);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);

    const program: WebGLProgram = requireNonNull(gl.createProgram());
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

    return program;
}
