import * as Preact from "preact";
import GameOverlay from "./ui/GameOverlay";

// create styles (in <head>)
import "../styles/main.less";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const uiRoot = document.createElement("div");
uiRoot.id = "root";
document.body.appendChild(uiRoot);

(async () => {
    function renderLoop(time: number) {
        window.requestAnimationFrame(renderLoop);
    }

    // start render loop
    window.requestAnimationFrame(renderLoop);

    // create user interface
    Preact.render(Preact.createElement(GameOverlay, {}), uiRoot);
})();
