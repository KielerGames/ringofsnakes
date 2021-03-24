import {
    MessageFromMain,
} from "./protocol/main-worker";
import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";
import GameData from "./data/GameData";
import * as GameRenderer from "./renderer/GameRenderer";

document.body.style.backgroundColor = "black";
GameRenderer.init(document.body);

const worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
worker.postMessage({
    tag: "ConnectToServer",
    playerName: "SnakeForceOne",
} as MessageFromMain);

const data = new GameData();

worker.addEventListener("message", (event) => {
    data.update(event.data.data as GameUpdateData);
    //TODO
});

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
