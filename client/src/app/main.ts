import * as Preact from "preact";
import Game from "./Game";
import GameOverlay from "./ui/GameOverlay";
import * as FrameTime from "./util/FrameTime";
import * as WebGLContextProvider from "./renderer/WebGLContextProvider";

// create styles (in <head>)
import "../styles/main.less";

// initialize main canvas
const canvas = document.createElement("canvas");
canvas.id = "main-canvas";
document.body.appendChild(canvas);
WebGLContextProvider.init(canvas);

// initialize UI container
const uiRoot = document.createElement("div");
uiRoot.id = "root";
document.body.appendChild(uiRoot);

(async () => {
    const game = await Game.joinAs("SnakeForceOne");

    function renderLoop(time: number) {
        FrameTime.update(time);

        setTimeout(() => game.update());
        window.requestAnimationFrame(renderLoop);
    }

    // start render loop
    window.requestAnimationFrame(renderLoop);

    // create user interface
    Preact.render(Preact.createElement(GameOverlay, { game }), uiRoot);
})();
