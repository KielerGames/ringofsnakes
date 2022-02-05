import * as Preact from "preact";
import Game from "./data/Game";
import GameOverlay from "./ui/GameOverlay";
import * as FrameTime from "./util/FrameTime";
import * as WebGLContextProvider from "./renderer/WebGLContextProvider";
import * as GameRenderer from "./renderer/GameRenderer";
import * as UserInput from "./input/UserInput";

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
UserInput.init(uiRoot);

document.title = `Snake Royale ${__VERSION__}`;

(async () => {
    FrameTime.update(performance.now());
    const [game, player] = await Game.joinAsPlayer("SnakeForceOne");

    function renderLoop(time: number) {
        FrameTime.update(time);
        game.predict();
        GameRenderer.render(game);

        if (player.alive) {
            setTimeout(() => game.update());
            window.requestAnimationFrame(renderLoop);
        } else {
            game.quit();
            console.log("Game stopped.");
        }
    }

    // start render loop
    window.requestAnimationFrame(renderLoop);

    // create user interface
    Preact.render(Preact.createElement(GameOverlay, { game }), uiRoot);

    // stop game on error
    window.addEventListener("error", (e) => {
        console.error("Stopped due to unhandled error.", e);
    });
})();
