import type { ReadonlyMatrix } from "../../math/Matrix";
import { compileShader } from "../webgl/ShaderLoader";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as TextureManager from "../webgl/TextureManager";
import Matrix from "../../math/Matrix";
import * as ResourceLoader from "../../ResourceLoader";

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
    const GL2 = WebGL2RenderingContext;

    const [shader, image] = await Promise.all([
        compileShader("background"),
        ResourceLoader.MAIN.loadImage("assets/background.svg", 128)
    ]);

    shaderProgram = shader;
    shaderProgram.setFixedBuffer(
        // prettier-ignore
        new Float32Array([
        0.0, 1.0, // top-left
        1.0, 1.0, // top-right
        0.0, 0.0, // bottom-left
        1.0, 0.0  // bottom-right
        ]).buffer
    );

    TextureManager.initTexture(
        textureSlot,
        {
            wrap: GL2.REPEAT,
            minFilter: GL2.LINEAR_MIPMAP_LINEAR,
            magFilter: GL2.LINEAR
        },
        (gl) => {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    );
})();
