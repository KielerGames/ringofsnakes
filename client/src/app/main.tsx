import * as Preact from "preact";
import * as GameRenderer from "./renderer/GameRenderer";
import Game from "./Game";
import GameUI from "./components/GameUI";

// create styles (in <head>)
import "../styles/main.less";

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
    //let lastTime = start;

    function renderLoop(time: number) {
        //const elapsed = (time - start) / 1000;
        //const deltaTime = (time - lastTime) / 1000;

        game.frameTick(time);
        GameRenderer.render(game.data, game.camera, time);

        if (!game.ended) {
            window.requestAnimationFrame(renderLoop);
        }
    }

    // start render loop
    window.requestAnimationFrame(renderLoop);

    // render user interface
    Preact.render(<GameUI game={game} />, root);

    // cleanup
    window.setInterval(() => {
        if (!game.ended) {
            const viewBox = game.camera.getViewBox();
            game.data.garbageCollectFoodChunks(viewBox);
        }
    }, 1000);
})();
