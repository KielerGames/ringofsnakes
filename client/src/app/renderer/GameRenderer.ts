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
import * as BackgroundRenderer from "./modules/BackgroundRenderer";
import { updateCanvasSize } from "./webgl/WebGLUtils";

export function render(game: Readonly<Game>): void {
    const gl = WebGLContextProvider.getContext();

    updateCanvasSize(gl);
    const canvas = gl.canvas as HTMLCanvasElement;
    game.camera.setRatio(canvas.clientWidth, canvas.clientHeight);

    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute transform matrix once
    const transform = game.camera.transformMatrix;

    // render parts
    BackgroundRenderer.render(transform);
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

SkinLoader.init();
