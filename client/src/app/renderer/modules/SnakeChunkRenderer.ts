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
import SnakeChunk from "../../data/snake/SnakeChunk";

const finalChunkBuffers = new WeakMap<SnakeChunk, WebGLBuffer>();
let basicMaterialShader: WebGLShaderProgram;
let growingChunkBuffer: WebGLBuffer;

(async () => {
    const gl = await WebGLContextProvider.waitForContext();

    basicMaterialShader = await compileShader(gl, "snake", [
        "aPosition",
        "aNormal",
        "aNormalOffset",
        "aRelativePathOffset"
    ]);

    growingChunkBuffer = gl.createBuffer()!;
    assert(growingChunkBuffer !== null);
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    const gl = WebGLContextProvider.getContext();
    const camera = game.camera;

    const shader = basicMaterialShader;
    shader.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

            shader.setUniform("uChunkPathOffset", chunk.offset);
            const data = chunk.gpuData;

            if (chunk.final) {
                if (finalChunkBuffers.has(chunk)) {
                    // Reuse previous data as it cannot change.
                    gl.bindBuffer(gl.ARRAY_BUFFER, finalChunkBuffers.get(chunk)!);
                } else {
                    const newBuffer = gl.createBuffer();
                    if (!newBuffer) {
                        throw new Error("Failed to create buffer for SnakeChunk.");
                    }
                    finalChunkBuffers.set(chunk, newBuffer);

                    // Transfer the data of final chunks only once (STATIC_DRAW).
                    gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);
                }
            } else {
                // Growing snake chunks can change with every frame, therefore
                // we have to copy the data to the GPU once per frame (DYNAMIC_DRAW).
                gl.bindBuffer(gl.ARRAY_BUFFER, growingChunkBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.DYNAMIC_DRAW);
            }

            // Draw the snake chunk
            shader.run(data.vertices, { mode: gl.TRIANGLE_STRIP });

            if (__DEBUG__) {
                addDebugBox(game, chunk);
            }
        }
    }
}

function addDebugBox(game: Readonly<Game>, chunk: Readonly<SnakeChunk>) {
    const gl = WebGLContextProvider.getContext();
    const snake = chunk.snake;

    BoxRenderer.addBox(
        chunk.boundingBox.createTransferable(0.5 * snake.width),
        SkinLoader.getFloatColor(snake.skin, chunk.final ? 0.64 : 0.3)
    );

    if (chunk !== snake.headChunk) {
        const worldPosition = new Vector(chunk.boundingBox.minX, chunk.boundingBox.maxY);
        const canvasPosition = game.camera.computeScreenCoordinates(worldPosition, gl.canvas);
        TextRenderer.addText(chunk.debugInfo, "sc" + chunk.id, {
            x: canvasPosition.x,
            y: canvasPosition.y,
            debug: true
        });
    }
}
