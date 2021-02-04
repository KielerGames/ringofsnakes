import { MessageFromMain, SnakeChunkData } from "./protocol/main-worker";
import * as Renderer from "./renderer/test";
import Matrix from "./webgl/Matrix";

document.body.style.backgroundColor = "black";
const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl")!;
canvas.width = 1280;
canvas.height = 720;
document.body.appendChild(canvas);

// background color
gl.clearColor(0.66, 0.85, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// transformation matrix (un-stretch)
const unstretch = new Matrix();
unstretch.setEntry(0, 0, canvas.height / canvas.width);

// create GPU buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

const program = Renderer.createSnakeShaderProgram(gl);
program.use();
program.setUniform("uColor", [0.2, 0.4, 1.0]);
program.setUniform("uTransform", unstretch.data);

const worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
worker.postMessage({
    tag: "ConnectToServer",
    playerName: "SnakeForceOne",
} as MessageFromMain);
worker.postMessage({
    tag: "UpdateTargetAlpha",
    alpha: 0.25 * Math.PI,
} as MessageFromMain);

worker.addEventListener("message", (event) => {
    console.log("Snake Chunk data!")
    const data = event.data.data as SnakeChunkData;
    gl.bufferData(gl.ARRAY_BUFFER, data.glVertexBuffer, gl.STATIC_DRAW);
    program.run(gl.TRIANGLE_STRIP, 0, data.vertices);
});
