import { GameUpdateData, MessageFromMain, SnakeChunkData } from "./protocol/main-worker";
import * as Renderer from "./renderer/test";
import Matrix from "./webgl/Matrix";
import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";
import GameData from "./data/GameData";

document.body.style.backgroundColor = "black";
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: false,
})!;
document.body.appendChild(canvas);

// background color
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// transformation matrix (un-stretch & scale)
const unstretch = new Matrix();
unstretch.setEntry(0, 0, canvas.height / canvas.width);

const scale = new Matrix();
scale.setEntry(0, 0, 0.042);
scale.setEntry(1, 1, 0.042);

// create GPU buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

const program = Renderer.createSnakeShaderProgram(gl);
program.bufferLayout = ["vPosition", "vLength", "vCenterOffset"];
console.log(program.bufferLayout);
program.use();
program.setUniform("uColor", [0.1, 0.2, 0.5]);
gl.clear(gl.COLOR_BUFFER_BIT);

const worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
worker.postMessage({
    tag: "ConnectToServer",
    playerName: "SnakeForceOne",
} as MessageFromMain);

const data = new GameData();

worker.addEventListener("message", (event) => {
    data.update(event.data.data as GameUpdateData);

    let translate = new Matrix();
    translate.setEntry(0, 3, -data.targetSnake.data.position.x);
    translate.setEntry(1, 3, -data.targetSnake.data.position.y);

    const transform = Matrix.compose(Matrix.compose(unstretch, scale), translate);
    program.setUniform("uTransform", transform.data);

    gl.clear(gl.COLOR_BUFFER_BIT);

    data.forEachChunk(chunk => {
        program.setUniform("uHeadOffset", chunk.data.offset);
        program.setUniform("uChunkLength", chunk.length);
        program.setUniform("uSnakeLength", chunk.snake.length);
        gl.bufferData(gl.ARRAY_BUFFER, chunk.data.glVertexBuffer, gl.STATIC_DRAW);
        program.run(gl.TRIANGLE_STRIP, 0, chunk.data.vertices);
    });
});

// react
const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
ReactDOM.render(<UserInput initial={0.0} onChange={updateAlpha} />, root);

function updateAlpha(newAlpha: number): void {
    worker.postMessage({
        tag: "UpdateTargetAlpha",
        alpha: newAlpha,
    } as MessageFromMain);
}
