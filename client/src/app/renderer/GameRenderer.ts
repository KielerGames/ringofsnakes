import Game from "../data/Game";
import * as WebGLContextProvider from "./webgl/WebGLContextProvider";
import * as TextureManager from "./webgl/TextureManager";
import * as SkinLoader from "./SkinLoader";
import * as SnakeHeadRenderer from "./modules/SnakeHeadRenderer";
import * as SnakeChunkRenderer from "./modules/SnakeChunkRenderer";
import * as BoxRenderer from "./modules/BoxRenderer";
import * as FoodRenderer from "./modules/FoodRenderer";
import * as TextRenderer from "./modules/TextRenderer";
import * as SnakeNameRenderer from "./modules/SnakeNameRenderer";
import * as HeatMapRenderer from "./modules/HeatMapRenderer";
import { updateCanvasSize } from "./webgl/WebGLUtils";

let texuresInitialized = false;

export function render(game: Readonly<Game>): void {
    const gl = WebGLContextProvider.getContext();

    updateCanvasSize(gl);
    const canvas = gl.canvas as HTMLCanvasElement;
    game.camera.setRatio(canvas.clientWidth, canvas.clientHeight);

    if (!texuresInitialized) {
        TextureManager.bindAllTextures();
        texuresInitialized = true;
    }

    // background color
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute transform matrix once
    const transform = game.camera.transformMatrix;

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

SkinLoader.init();
