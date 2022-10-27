import FoodChunk from "../../data/world/FoodChunk";
import Game from "../../data/Game";
import type { ReadonlyMatrix } from "../../math/Matrix";
import Vector from "../../math/Vector";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as BoxRenderer from "./BoxRenderer";
import { compileShader } from "../webgl/ShaderLoader";
import assert from "../../util/assert";

let shader: WebGLShaderProgram;

const FAR_AWAY = new Vector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

(async () => {
    const GL2 = WebGL2RenderingContext;
    shader = await compileShader("food", ["aPosition", "aLocalPos", "aColorIndex"]);
    assert(shader.attributeStride === FoodChunk.VERTEX_BYTE_SIZE);
    shader.setBlendFunction(GL2.SRC_ALPHA, GL2.ONE);
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    const targetSnake = game.targetSnake;
    const attractor = targetSnake ? targetSnake.position : FAR_AWAY;

    shader.use((gl) => {
        shader.setUniform("uColorSampler", 0);
        shader.setUniform("uTransform", transform.data);
        shader.setUniform("uAttractorPosition", [attractor.x, attractor.y]);

        for (const chunk of game.foodChunks.values()) {
            if (!chunk.isVisible(game.camera)) {
                continue;
            }

            chunk.useBuffer(gl);

            shader.run(chunk.numberOfVertices);

            if (__DEBUG__) {
                BoxRenderer.addBox(chunk.box, [0.1, 0.5, 1, 0.333]);
            }
        }
    });
}
