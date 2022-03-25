import Game from "../data/Game";
import * as WebGLContextProvider from "./webgl/WebGLContextProvider";
import * as SkinLoader from "./SkinLoader";
import * as SnakeHeadRenderer from "./modules/SnakeHeadRenderer";
import * as SnakeChunkRenderer from "./modules/SnakeChunkRenderer";
import * as BoxRenderer from "./modules/BoxRenderer";
import * as FoodRenderer from "./modules/FoodRenderer";
import * as TextRenderer from "./modules/TextRenderer";
import * as SnakeNameRenderer from "./modules/SnakeNameRenderer";
import * as HeatMapRenderer from "./modules/HeatMapRenderer";

export function render(game: Readonly<Game>): void {
    const gl = WebGLContextProvider.getContext();

    updateSize(gl);
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
    SnakeChunkRenderer.render(game, transform);
    SnakeHeadRenderer.render(game, transform);
    SnakeNameRenderer.render(game);

    if (__DEBUG__) {
        BoxRenderer.renderAll(transform);
    }
    TextRenderer.renderAll();
    HeatMapRenderer.render(game);

}

function updateSize(gl: WebGLRenderingContext) {
    const canvas = gl.canvas as HTMLCanvasElement;

    // get current canvas size in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        if (__DEBUG__) {
            console.info("Resizing canvas...");
        }

        // resize canvas
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // update clip space to screen pixel transformation
        gl.viewport(0, 0, displayWidth, displayHeight);
    }
}
