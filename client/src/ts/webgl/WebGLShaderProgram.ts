type FloatData = null | number | number[] | Float32Array;

export default class WebGLShaderProgram {
    private gl:WebGLRenderingContext;
    private program:WebGLProgram;
    private uniforms:Map<string, ShaderVar<WebGLUniformLocation>> = new Map();
    private attribs: Map<string, ShaderVar<number>>  = new Map();
    private bufferLayout: string[] = [];
    private autoStride:number = 0;

    public constructor(
        gl:WebGLRenderingContext,
        vertex:string,
        fragment:string,
        validate:boolean = false
    ) {
        this.gl = gl;

        // compile & link shader program
        let vs = compileShader(gl, gl.VERTEX_SHADER, vertex),
            fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
        
        let program: WebGLProgram = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        // check for errors
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Shader linking failed: " + gl.getProgramInfoLog(program));
        }

        if(validate) {
            gl.validateProgram(program);

            if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                console.error("WebGL program info log", gl.getProgramInfoLog(program));
                throw new Error("Shader program validation failed.");
            }
        }

        this.program = program;

        // get shader attributes & uniforms
        // attributes & uniforms are "active" after linking
        let numberOfAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        let numberOfUniforms   = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        
        for(let i=0; i<numberOfAttributes; i++) {
            const info     = gl.getActiveAttrib(program, i)!;
            const location = gl.getAttribLocation(program, info.name);
            this.attribs.set(info.name, new ShaderVar(info, location));
            this.bufferLayout.push(info.name);
        }

        this.computeStride();

        for(let i=0; i<numberOfUniforms; i++) {
            const info     = gl.getActiveUniform(program, i)!;
            const location = gl.getUniformLocation(program, info.name)!;
            this.uniforms.set(info.name, new ShaderVar(info, location));
        }
    }

    private computeStride() {
        let sum = 0;
        this.attribs.forEach(attrib => {
            if(attrib.value === null) {
                sum += attrib.size;
            }
        });
        this.autoStride = sum * Float32Array.BYTES_PER_ELEMENT;
    }

    public use():void {
        this.gl.useProgram(this.program);
    }

    public run(
        mode:number = this.gl.TRIANGLES,
        start:number = 0,
        count:number,
        stride:number = this.autoStride
    ):void {
        const gl = this.gl;

        let offset = 0;
        for(const name of this.bufferLayout) {
            const attrib = this.attribs.get(name)!; // TODO?
            if(attrib.value === null) {
                gl.enableVertexAttribArray(attrib.location);
                gl.vertexAttribPointer(
                    attrib.location,
                    attrib.size,
                    gl.FLOAT,
                    false,
                    stride,
                    offset * Float32Array.BYTES_PER_ELEMENT
                );
                offset += attrib.size;
            } else {
                //TODO
                // gl.vertexAttrib[1234]f[v]()
                throw new Error("Constant values for attributes not yet implemented!");
            }
        }

        this.uniforms.forEach((uniform, name) => {
            if(uniform.value !== null) {
                if(uniform.type === gl.FLOAT) {
                    gl.uniform1f(uniform.location, uniform.value as number);
                } else if(uniform.type === gl.FLOAT_VEC2) {
                    gl.uniform2fv(uniform.location, uniform.value as number[]);
                } else if(uniform.type === gl.FLOAT_VEC3) {
                    gl.uniform3fv(uniform.location, uniform.value as number[]);
                } else if(uniform.type === gl.FLOAT_VEC4) {
                    gl.uniform4fv(uniform.location, uniform.value as number[]);
                } else if(uniform.type === gl.FLOAT_MAT4) {
                    gl.uniformMatrix4fv(uniform.location, false, uniform.value as number[]);
                } else {
                    throw new Error(`Type ${uniform.type} not implemented.`);
                }
            }
        });

        gl.drawArrays(mode, start, count);
    }

    public get context() {
        return this.gl;
    }

    public setAttribute(name:string, value:FloatData):void {
        let attrib = this.attribs.get(name);

        if(attrib) {
            let stateChanged = (attrib.value === null) !== (value === null);
            attrib.value = value;
            if(stateChanged) {
                this.computeStride();
            }
        } else {
            throw new Error(`Attribute ${name} does not exist.`);
        }
    }

    public setUniform(name:string, value:FloatData):void {
        let uniform = this.uniforms.get(name);

        if(uniform) {
            uniform.value = value;
        } else {
            throw new Error(`Uniform ${name} does not exist.`);
        }
    }
}

class ShaderVar<L> {
    public readonly name:string;
    public readonly type:number;
    public readonly location:L;
    public readonly size:number;
    public value:FloatData = null;
    public constructor(info:WebGLActiveInfo, location:L) {
        this.name     = info.name;
        this.type     = info.type;
        this.size     = SIZES.get(info.type)! * info.size; // TODO?
        this.location = location;
    }
}

function compileShader(gl:WebGLRenderingContext, type:number, source:string): WebGLShader {
    let shader: WebGLShader = gl.createShader(type)!;
  
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
    [WebGLRenderingContext.FLOAT, 1],
    [WebGLRenderingContext.FLOAT_VEC2, 2],
    [WebGLRenderingContext.FLOAT_VEC3, 3],
    [WebGLRenderingContext.FLOAT_VEC4, 4],
    [WebGLRenderingContext.FLOAT_MAT3, 3*3],
    [WebGLRenderingContext.FLOAT_MAT4, 4*4]
]);
