import * as Preact from "preact";
import GameOverlay from "./ui/GameOverlay";

// create styles (in <head>)
import "../styles/main.less";

const uiRoot = document.createElement("div");
uiRoot.id = "root";
document.body.appendChild(uiRoot);

Preact.render(Preact.createElement(GameOverlay, {}), uiRoot);