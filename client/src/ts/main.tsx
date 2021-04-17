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
    const start = performance.now();

    async function renderLoop(time: number) {
        const elapsed = time - start;
        
        GameRenderer.render(game.data);
        
        if(!game.ended) {
            window.requestAnimationFrame(renderLoop);
        }
    }

    window.requestAnimationFrame(renderLoop);

    ReactDOM.render(
        <UserInput initial={0.0} onChange={game.updateUserInput.bind(game)} />,
        root
    );
})();
