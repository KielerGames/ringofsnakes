import { ReadonlyMatrix } from "../../math/Matrix";
import WebGLShaderProgram from "../webgl/WebGLShaderProgram";
import * as SkinManager from "../SkinLoader";
import Game from "../../data/Game";
import { compileShader } from "../webgl/ShaderLoader";

let shader: WebGLShaderProgram;

const VERTEX_SIZE = 2;
const vertexData = mirror([
    [0.5, -1.0],
    [1.0, 0.0],
    [0.4, 2.0]
]);
const rotOffset = -0.5 * Math.PI;

(async () => {
    shader = await compileShader("head");
    shader.setFixedBuffer(vertexData);
})();

export function render(game: Readonly<Game>, transform: ReadonlyMatrix): void {
    shader.use((gl) => {
        shader.setUniform("uTransform", transform.data);

        for (const snake of game.snakes.values()) {
            if (!snake.hasChunks() || !snake.isHeadVisible(game.camera)) {
                continue;
            }

            const { x, y } = snake.position;
            shader.setUniform("uSnakeWidth", 1.25 * snake.width);
            shader.setUniform("uHeadPosition", [x, y]);
            shader.setUniform("uHeadRotation", snake.direction + rotOffset);
            shader.setUniform("uSnakeFast", snake.smoothedFastValue);
            SkinManager.setColor(shader, "uSkin", snake.skin);

            shader.run(vertexData.length / VERTEX_SIZE, {
                mode: gl.TRIANGLE_STRIP
            });
        }
    });
}

function mirror(points: [number, number][]): Float32Array {
    const data = new Float32Array(VERTEX_SIZE * points.length * 2);

    let i = 0;
    for (const [x, y] of points) {
        // left
        data[i++] = -x;
        data[i++] = y;
        // right
        data[i++] = x;
        data[i++] = y;
    }

    return data;
}
