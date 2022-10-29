import Game from "../../data/Game";
import type { ReadonlyMatrix } from "../../math/Matrix";
import Vector from "../../math/Vector";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as BoxRenderer from "./BoxRenderer";
import { compileShader } from "../webgl/ShaderLoader";

let shader: WebGLShaderProgram;

const FAR_AWAY = new Vector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

// prettier-ignore
const BOX_COORDS = new Float32Array([
    // triangle 1
    -1,  1, // top-left
     1,  1, // top-right
    -1, -1, // bottom-left
    // triangle 2
    -1, -1, // bottom-left
     1,  1, // top-right
     1, -1  // bottom-right
]);

(async () => {
    const GL2 = WebGL2RenderingContext;
    shader = await compileShader("food");
    shader.setFixedBuffer(BOX_COORDS, ["aLocalPos"]);
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
            shader.useAttributesForInstancedDrawing(["aPosition", "aColorIndex"], 1);

            shader.run(BOX_COORDS.length / 2, {
                instances: chunk.length
            });

            if (__DEBUG__) {
                BoxRenderer.addBox(chunk.box, [0.1, 0.5, 1, 0.333]);
            }
        }
    });
}
