import {
    MessageFromMain
} from "./protocol/main-worker";
import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";
import GameData from "./data/GameData";
import * as GameRenderer from "./renderer/GameRenderer";
import WorkerManager from "./WorkerManager";

document.body.style.backgroundColor = "black";
GameRenderer.init(document.body);

const worker = new WorkerManager();

worker.postMessage({
    tag: "ConnectToServer",
    playerName: "SnakeForceOne",
});

const data = new GameData();

async function renderLoop() {
    const frameData = await worker.requestFrameData(42.0);
    data.update(frameData);
    window.requestAnimationFrame(renderLoop);
}

// react
const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
ReactDOM.render(<UserInput initial={0.0} onChange={onInputChange} />, root);

function onInputChange(newAlpha: number, newFast: boolean): void {
    worker.postMessage({
        tag: "UpdateUserInput",
        alpha: newAlpha,
        fast: newFast,
    } as MessageFromMain);
}
