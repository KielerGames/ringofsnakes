import * as Preact from "preact";
import Game from "./data/Game";
import GameOverlay from "./ui/GameOverlay";
import * as FrameTime from "./util/FrameTime";
import * as WebGLContextProvider from "./renderer/webgl/WebGLContextProvider";
import * as TextRenderer from "./renderer/modules/TextRenderer";
import * as GameRenderer from "./renderer/GameRenderer";
import * as UserInput from "./input/UserInput";
import * as InputDirectionDisplay from "./ui/InputDirectionDisplay";
import { dialog, init as initDialogs } from "./ui/Dialogs";

// create styles (in <head>)
import "../styles/main.less";

// initialize main canvas
const canvas = document.createElement("canvas");
canvas.id = "mainCanvas";
document.body.appendChild(canvas);
WebGLContextProvider.init(canvas);

// text layer
const textLayer = document.createElement("div");
textLayer.id = "textLayer";
document.body.appendChild(textLayer);
TextRenderer.init(textLayer);

InputDirectionDisplay.appendTo(document.body);

// initialize UI container
const uiRoot = document.createElement("div");
uiRoot.id = "root";
document.body.appendChild(uiRoot);
UserInput.init(uiRoot);

initDialogs();

document.title = `Ring of Snakes ${__VERSION__}`;

(async () => {
    if (window.location.protocol === "https:") {
        const { host, pathname } = window.location;
        const httpUrl = `http://${host}${pathname}`;
        await dialog({
            title: "Error",
            content: (
                <>
                    Unfortunately <b>HTTPS</b> is not yet supported.{"\n"}Please use HTTP instead:{" "}
                    <pre>{httpUrl}</pre>
                </>
            ),
            buttons: [
                {
                    label: "Switch to HTTP",
                    action: () => window.location.replace(httpUrl)
                }
            ]
        });
        return;
    }

    FrameTime.update(performance.now());
    const [game, player] = await Game.joinAsPlayer();

    function renderLoop(time: number) {
        FrameTime.update(time);
        game.predict();
        GameRenderer.render(game);
        UserInput.tick();

        if (player.alive) {
            setTimeout(() => game.update());
            window.requestAnimationFrame(renderLoop);
        } else {
            game.quit();
            console.log("Game stopped.");
            document.exitPointerLock();
        }
    }

    // start render loop
    window.requestAnimationFrame(renderLoop);

    // create user interface
    Preact.render(Preact.createElement(GameOverlay, { game }), uiRoot);

    // stop game on error
    window.addEventListener("error", (e) => {
        game.quit();
        console.error("Stopped due to unhandled error.", e);
    });
})();
