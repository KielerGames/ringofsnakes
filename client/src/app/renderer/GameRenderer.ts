import Game from "../data/Game";
import * as WebGLContextProvider from "./WebGLContextProvider";
import * as SkinLoader from "./SkinLoader";
import * as SnakeHeadRenderer from "./parts/SnakeHeadRenderer";
import * as SnakeChunkRenderer from "./parts/SnakeChunkRenderer";
import * as BoxRenderer from "./parts/BoxRenderer";
import * as FoodRenderer from "./parts/FoodRenderer";

export function render(game: Readonly<Game>): void {
    const gl = WebGLContextProvider.getContext();
    const canvas = gl.canvas as HTMLCanvasElement;
    game.camera.setRatio(canvas.clientWidth, canvas.clientHeight);

    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute transform matrix once
    const transform = game.camera.transformMatrix;

    SkinLoader.setSkinTexture();

    // render parts
    FoodRenderer.render(game, transform);
    SnakeChunkRenderer.render(game.snakeChunks.values(), transform);
    SnakeHeadRenderer.render(game.snakes.values(), transform);

    if (__DEBUG__) {
        BoxRenderer.renderAll(transform);
    }
}
