import Matrix from "../../math/Matrix";
import { mix } from "../../util/ColorUtils";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../WebGLContextProvider";
import * as BoxRenderer from "./BoxRenderer";
import * as SkinLoader from "../SkinLoader";
import assert from "../../util/assert";
import Game from "../../data/Game";

declare const __VERTEXSHADER_SNAKE__: string;
declare const __FRAGMENTSHADER_SNAKE__: string;

let basicMaterialShader: WebGLShaderProgram;
let buffer: WebGLBuffer;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    basicMaterialShader = new WebGLShaderProgram(
        gl,
        __VERTEXSHADER_SNAKE__,
        __FRAGMENTSHADER_SNAKE__,
        ["vPosition", "vNormal", "vNormalOffset", "vRelativePathOffset"]
    );

    buffer = gl.createBuffer()!;
    assert(buffer !== null);
})();

export function render(game: Readonly<Game>, transform: Matrix): void {
    const gl = WebGLContextProvider.getContext();
    const camera = game.camera;

    const shader = basicMaterialShader;
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);
    shader.setUniform("uColorSampler", 0);

    for (const chunk of game.snakeChunks.values()) {
        if (!chunk.isVisible(camera)) {
            continue;
        }
        const snake = chunk.snake;
        const data = chunk.gpuData;

        SkinLoader.setColor(shader, "uSkin", snake.skin);
        shader.setUniform("uChunkPathOffset", chunk.offset);
        shader.setUniform("uSnakeLength", snake.length);
        shader.setUniform("uSnakeMaxWidth", snake.width);
        shader.setUniform(
            "uSnakeThinningStart",
            Math.min(0.75, snake.length * 0.025) * snake.length
        );

        gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STREAM_DRAW);
        shader.run(data.vertices, { mode: gl.TRIANGLE_STRIP });

        if (__DEBUG__) {
            const age = chunk.age;
            BoxRenderer.addBox(
                chunk.boundingBox.createTransferable(0.5 * snake.width),
                mix([0.1, 1, 1, 0.64], [0.5, 1.0, 0, 0.025 + 0.3 / Math.max(1.0, age)], 2.0 * age)
            );
        }
    }
}
