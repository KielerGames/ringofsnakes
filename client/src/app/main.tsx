import * as Preact from "preact";
import Game from "./data/Game";
import GameOverlay from "./ui/GameOverlay";
import * as FrameTime from "./util/FrameTime";
import AsyncEvent from "./util/AsyncEvent";
import * as WebGLContextProvider from "./renderer/webgl/WebGLContextProvider";
import * as TextRenderer from "./renderer/modules/TextRenderer";
import * as GameRenderer from "./renderer/GameRenderer";
import * as UserInput from "./input/UserInput";
import * as InputDirectionDisplay from "./ui/InputDirectionDisplay";
import * as ResourceLoader from "./ResourceLoader";
import { dialog, init as initDialogs } from "./ui/Dialogs";

// create styles (in <head>)
import "../styles/main.less";
import LoadingScreen from "./ui/components/LoadingScreen";

// initialize main canvas
const canvas = document.createElement("canvas");
canvas.id = "mainCanvas";
document.body.append(canvas);
WebGLContextProvider.init(canvas);

// text layer
const textLayer = document.createElement("div");
textLayer.id = "textLayer";
document.body.append(textLayer);
TextRenderer.init(textLayer);

InputDirectionDisplay.appendTo(document.body);

// initialize UI container
const uiRoot = document.createElement("div");
uiRoot.id = "root";
document.body.append(uiRoot);
Preact.render(Preact.createElement(LoadingScreen, { stage: ResourceLoader.MAIN }), uiRoot);
UserInput.init(uiRoot);

initDialogs();

(async () => {
    await ResourceLoader.MAIN.waitForCompletion();
    console.log("Loading completed.");

    FrameTime.update(performance.now());

    while (true) {
        await runGame();
        // TODO make sure previous connection is closed or gets reused
    }
})();

async function runGame() {
    const [game, player] = await Game.joinAsPlayer();
    const gameStopped = new AsyncEvent();

    function renderLoop(time: number) {
        FrameTime.update(time);
        game.predict();
        GameRenderer.render(game);

        if (player.alive) {
            UserInput.tick();
        }

        setTimeout(() => game.update());
        window.requestAnimationFrame(renderLoop);
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

    game.events.snakeDeath.addListener(async (info) => {
        if (info.deadSnakeId !== player.snakeId) {
            return;
        }

        document.exitPointerLock();

        const action = await dialog({
            title: "Game over",
            content: info.killer
                ? `You are dead because you crashed into ${info.killer.name}.`
                : "You are dead.",
            buttons: [
                {
                    label: "Spectate",
                    value: "spectate"
                },
                {
                    label: "Try again",
                    value: "try-again"
                }
            ]
        });

        if (action === "try-again") {
            gameStopped.set();
        }
    });

    game.events.gameEnd.addListener(async (info) => {
        if (info.reason === "disconnect") {
            await dialog({
                title: "Disconnected",
                content: `You have been disconnected from the server.`,
                buttons: [
                    {
                        label: "Try again",
                        value: "try-again"
                    }
                ]
            });
            gameStopped.set();
        }
    });

    return gameStopped.wait();
}
