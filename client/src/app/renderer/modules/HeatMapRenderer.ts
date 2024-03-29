import Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import Vector from "../../math/Vector";
import Matrix from "../../math/Matrix";
import { compileShader } from "../webgl/ShaderLoader";
import * as TextureManager from "../webgl/TextureManager";

const transform = new Matrix(true);
let shaderProgram: WebGLShaderProgram;
let texture1: WebGLTexture;
let texture2: WebGLTexture;
let textureMix = 0.0;
let texture1IsCurrent: boolean = true;
let lastTextureData: Uint8Array | null = null;

const heatMapSize = 128;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    shaderProgram = await compileShader("heatmap");
    shaderProgram.setFixedBuffer(
        // prettier-ignore
        new Float32Array([
        0.0, 1.0, // top-left
        1.0, 1.0, // top-right
        0.0, 0.0, // bottom-left
        1.0, 0.0  // bottom-right
        ]).buffer
    );

    texture1 = TextureManager.initTexture(2, {
        wrap: gl.CLAMP_TO_EDGE,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR
    });

    texture2 = TextureManager.initTexture(3, {
        wrap: gl.CLAMP_TO_EDGE,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR
    });

    if (__DEBUG__) {
        console.info(`HeatMapRenderer initialized.`);
    }
})();

export function render(game: Readonly<Game>): void {
    shaderProgram.use((gl) => {
        updateTransformMatrix(gl);
        const position = game.camera.position;
        manageData(gl, game);

        shaderProgram.setUniform("uHeatMapTexture1", 2);
        shaderProgram.setUniform("uHeatMapTexture2", 3);
        shaderProgram.setUniform("uTextureMix", textureMix);
        shaderProgram.setUniform("uCameraPosition", worldToMapCoordinates(game, position));
        shaderProgram.setUniform("uTransform", transform.data);

        shaderProgram.run(4, { mode: gl.TRIANGLE_STRIP });
    });
}

function updateTransformMatrix(gl: WebGL2RenderingContext): void {
    const { width: cw, height: ch } = gl.canvas;
    const sx = 2.0 / cw;
    const sy = 2.0 / ch;
    const offset = 10;

    transform.setEntry(0, 0, sx * heatMapSize);
    transform.setEntry(1, 1, sy * heatMapSize);
    transform.setEntry(0, 2, 1.0 - sx * (heatMapSize + offset));
    transform.setEntry(1, 2, -1.0 + sy * offset);
}

function worldToMapCoordinates(game: Readonly<Game>, worldPosition: Vector): [number, number] {
    const cc = game.config.chunks;
    const width = cc.columns * cc.size;
    const height = cc.rows * cc.size;
    return [(0.5 * width + worldPosition.x) / width, (0.5 * height + worldPosition.y) / height];
}

function manageData(gl: WebGL2RenderingContext, game: Readonly<Game>): void {
    const { columns: width, rows: height } = game.config.chunks;

    const targetMix = texture1IsCurrent ? 0.0 : 1.0;
    textureMix = 0.8 * textureMix + 0.2 * targetMix;

    if (lastTextureData === game.heatMap) {
        return;
    }

    if (!texture1IsCurrent || lastTextureData === null) {
        gl.activeTexture(gl.TEXTURE2);
    } else {
        gl.activeTexture(gl.TEXTURE3);
    }

    if (texture1IsCurrent) {
        gl.bindTexture(gl.TEXTURE_2D, texture2);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, texture1);
    }

    // send texture data to gpu
    const format = gl.LUMINANCE;
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        width,
        height,
        0,
        format,
        gl.UNSIGNED_BYTE,
        game.heatMap
    );

    if (lastTextureData !== null) {
        texture1IsCurrent = !texture1IsCurrent;
        textureMix = texture1IsCurrent ? 1.0 : 0.0;
    }

    lastTextureData = game.heatMap;
}
