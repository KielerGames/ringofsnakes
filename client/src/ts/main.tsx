import { MessageFromMain, SnakeChunkData } from "./protocol/main-worker";
import * as Renderer from "./renderer/test";
import Matrix from "./webgl/Matrix";
import ReactDOM from "react-dom";
import React from "react";
import UserInput from "./components/UserInput";

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

const transform = Matrix.compose(scale, unstretch);

// create GPU buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

const program = Renderer.createSnakeShaderProgram(gl);
program.bufferLayout = ["vPosition", "vLength", "vCenterOffset"];
console.log(program.bufferLayout);
program.use();
program.setUniform("uColor", [0.1, 0.2, 0.5]);
program.setUniform("uTransform", transform.data);
gl.clear(gl.COLOR_BUFFER_BIT);

const worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
worker.postMessage({
    tag: "ConnectToServer", //"RunTest",
    playerName: "SnakeForceOne",
} as MessageFromMain);

const chunks: SnakeChunkData[] = [];
const snakeLength = 150;
let totalLength = 0.0;

worker.addEventListener("message", (event) => {
    const data = event.data.data as SnakeChunkData;

    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let chunk of chunks) {
        gl.bufferData(gl.ARRAY_BUFFER, chunk.glVertexBuffer, gl.STATIC_DRAW);
        program.run(gl.TRIANGLE_STRIP, 0, chunk.vertices);
    }

    gl.bufferData(gl.ARRAY_BUFFER, data.glVertexBuffer, gl.STATIC_DRAW);
    program.run(gl.TRIANGLE_STRIP, 0, data.vertices);

    if(totalLength + data.length > snakeLength) {
        let deletedChunk = chunks.shift();
        totalLength -= deletedChunk!.length;
    }

    if (data.full) {
        let i = chunks.findIndex(c => c.chunkId === data.chunkId);
        if(i === -1) {
            console.log(`Chunk ${data.chunkId} of snake ${data.snakeId} is (almost) full.`);
            console.log(`total length is ${totalLength}`);
            chunks.push(data);
            totalLength += data.length;
        } else {
            totalLength += data.length - chunks[i].length;
            chunks[i] = data;
        }
    }
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
