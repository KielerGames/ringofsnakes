import { ReadonlyMatrix } from "../../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import * as BoxRenderer from "./BoxRenderer";
import * as TextRenderer from "./TextRenderer";
import * as SkinLoader from "../SkinLoader";
import assert from "../../util/assert";
import Game from "../../data/Game";
import Vector from "../../math/Vector";
import { compileShader } from "../webgl/ShaderLoader";

let basicMaterialShader: WebGLShaderProgram;
let buffer: WebGLBuffer;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    basicMaterialShader = await compileShader(gl, "snake", [
        "aPosition",
        "aNormal",
        "aNormalOffset",
        "aRelativePathOffset"
    ]);

    buffer = gl.createBuffer()!;
    assert(buffer !== null);
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    const gl = WebGLContextProvider.getContext();
    const camera = game.camera;

    const shader = basicMaterialShader;
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    shader.setUniform("uTransform", transform.data);
    shader.setUniform("uColorSampler", 0);

    for (const snake of game.snakes.values()) {
        if (!snake.hasChunks()) {
            continue;
        }

        // Set the snake specific uniforms once.
        SkinLoader.setColor(shader, "uSkin", snake.skin);
        shader.setUniform("uSnakeLength", snake.length);
        shader.setUniform("uSnakeMaxWidth", snake.width);
        shader.setUniform(
            "uSnakeThinningStart",
            Math.min(0.75, snake.length * 0.025) * snake.length
        );

        // The SnakeChunks are sorted by chunk id, s.t. the latest
        // chunk will be last. Therefore newer chunks will be rendered
        // on top of older chunks.
        for (const chunk of snake.getSnakeChunksIterator()) {
            if (!chunk.isVisible(camera)) {
                continue;
            }

            const data = chunk.gpuData;
            shader.setUniform("uChunkPathOffset", chunk.offset);

            // TODO tim-we: optimize final chunks
            gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STREAM_DRAW);
            shader.run(data.vertices, { mode: gl.TRIANGLE_STRIP });

            if (__DEBUG__) {
                BoxRenderer.addBox(
                    chunk.boundingBox.createTransferable(0.5 * snake.width),
                    SkinLoader.getFloatColor(snake.skin, chunk.final ? 0.64 : 0.3)
                );

                if (chunk !== snake.headChunk) {
                    const worldPosition = new Vector(
                        chunk.boundingBox.minX,
                        chunk.boundingBox.maxY
                    );
                    const canvasPosition = game.camera.computeScreenCoordinates(
                        worldPosition,
                        gl.canvas
                    );
                    TextRenderer.addText(chunk.debugInfo, "sc" + chunk.id, {
                        x: canvasPosition.x,
                        y: canvasPosition.y,
                        debug: true
                    });
                }
            }
        }
    }
}
