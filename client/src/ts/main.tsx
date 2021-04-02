import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";
import * as GameRenderer from "./renderer/GameRenderer";
import Game from "./Game";

// init
document.body.style.backgroundColor = "black";
GameRenderer.init(document.body);

// react
const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

(async () => {
    const game = await Game.joinAs("SnakeForceOne");

    async function renderLoop() {
        await game.update();
        GameRenderer.render(game.data);
        window.requestAnimationFrame(renderLoop);
    }

    window.requestAnimationFrame(renderLoop);

    ReactDOM.render(
        <UserInput initial={0.0} onChange={game.updateUserInput.bind(game)} />,
        root
    );
})();
