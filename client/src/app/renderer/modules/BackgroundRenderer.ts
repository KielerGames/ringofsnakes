import type { ReadonlyMatrix } from "../../math/Matrix";
import { compileShader } from "../webgl/ShaderLoader";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import * as TextureManager from "../webgl/TextureManager";
import Matrix from "../../math/Matrix";

let shaderProgram: WebGLShaderProgram;
const textureSlot = 4;
const invTransform = new Matrix(false);

export function render(transform: ReadonlyMatrix): void {
    Matrix.inverse(transform, invTransform);

    shaderProgram.use((gl) => {
        shaderProgram.setUniform("uTexture", textureSlot);
        shaderProgram.setUniform("uInvTransform", invTransform.data);

        shaderProgram.run(4, { mode: gl.TRIANGLE_STRIP });
    });
}

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    shaderProgram = await compileShader("background");
    shaderProgram.setFixedBuffer(
        // prettier-ignore
        new Float32Array([
        0.0, 1.0, // top-left
        1.0, 1.0, // top-right
        0.0, 0.0, // bottom-left
        1.0, 0.0  // bottom-right
        ]).buffer
    );

    const image = await TextureManager.loadImage("assets/background.svg", 64);

    TextureManager.initTexture(
        textureSlot,
        {
            wrap: gl.REPEAT,
            minFilter: gl.LINEAR_MIPMAP_LINEAR,
            magFilter: gl.LINEAR
        },
        (gl) => {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    );
})();
