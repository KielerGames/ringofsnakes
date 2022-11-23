import type { ReadonlyMatrix } from "../../math/Matrix";
import type SnakeChunk from "../../data/snake/SnakeChunk";
import type Game from "../../data/Game";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as WebGLContextProvider from "../webgl/WebGLContextProvider";
import * as BoxRenderer from "./BoxRenderer";
import * as TextRenderer from "./TextRenderer";
import * as SkinLoader from "../SkinLoader";
import Vector from "../../math/Vector";
import { compileShader } from "../webgl/ShaderLoader";
import * as TextureManager from "../webgl/TextureManager";

const finalChunkBuffers = new WeakMap<SnakeChunk, WebGLBuffer>();
const growingChunkBuffers = new WeakMap<SnakeChunk, WebGLBuffer>();
let shader: WebGLShaderProgram;

(async () => {
    shader = await compileShader("snake", [
        "aPosition",
        "aNormal",
        "aNormalOffset",
        "aRelativePathOffset"
    ]);

    const GL2 = WebGL2RenderingContext;
    const image = await TextureManager.loadImage("assets/scales.svg", 128);
    TextureManager.initTexture(
        1,
        {
            wrap: GL2.REPEAT,
            minFilter: GL2.LINEAR_MIPMAP_LINEAR
        },
        (gl) => {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    );
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    const camera = game.camera;

    shader.use((gl) => {
        shader.setUniform("uTransform", transform.data);
        shader.setUniform("uColorSampler", 0);
        shader.setUniform("uScalesTexture", 1);

        for (const snake of game.snakes.values()) {
            if (!snake.hasChunks()) {
                continue;
            }

            // Set the snake specific uniforms once.
            SkinLoader.setColor(shader, "uSkin", snake.skin);
            shader.setUniform("uSnakeFast", snake.smoothedFastValue);
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
                if (!chunk.couldBeVisible(camera)) {
                    continue;
                }

                shader.setUniform("uChunkPathOffset", chunk.offset);
                const data = chunk.gpuData;

                if (chunk.final) {
                    if (!finalChunkBuffers.has(chunk)) {
                        // Create a new buffer or move existing buffer to finalChunkBuffers.
                        const buffer = growingChunkBuffers.get(chunk) ?? createBuffer();
                        finalChunkBuffers.set(chunk, buffer);
                        growingChunkBuffers.delete(chunk);

                        // Transfer the data of final chunks only once (STATIC_DRAW).
                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);
                    } else {
                        // Data has already been transferred to the GPU.
                        gl.bindBuffer(gl.ARRAY_BUFFER, finalChunkBuffers.get(chunk)!);
                    }
                } else {
                    // Create a new buffer or reuse existing.
                    const buffer = growingChunkBuffers.get(chunk) ?? createBuffer();
                    growingChunkBuffers.set(chunk, buffer);

                    // Growing snake chunks can change with every frame, therefore
                    // we have to copy the data to the GPU once per frame (STREAM_DRAW).
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STREAM_DRAW);
                    // TODO: this could be improved by using bufferSubData
                }

                // Draw the snake chunk
                shader.run(data.vertices, { mode: gl.TRIANGLE_STRIP });

                if (__DEBUG__) {
                    addDebugBox(game, chunk);
                }
            }
        }
    });
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

function createBuffer(): WebGLBuffer {
    const gl = WebGLContextProvider.getContext();
    const buffer = gl.createBuffer();
    if (buffer === null) {
        throw new Error("Failed to create WebGL buffer.");
    }
    return buffer;
}
