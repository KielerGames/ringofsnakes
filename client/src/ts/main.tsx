import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";
import * as GameRenderer from "./renderer/GameRenderer";
import Game from "./Game";

document.body.style.backgroundColor = "black";
GameRenderer.init(document.body);
const game = new Game("SnakeForceOne");

async function renderLoop() {
    await game.update();
    GameRenderer.render(game.data);
    window.requestAnimationFrame(renderLoop);
}

// react
const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
ReactDOM.render(<UserInput initial={0.0} onChange={game.updateUserInput.bind(game)} />, root);
