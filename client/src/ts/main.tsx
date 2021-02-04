import * as Renderer from "./renderer/test";

const worker = new Worker("worker.bundle.js", { name: "SnakeWorker" });
worker.postMessage({ a: 1 });
worker.addEventListener("message", (event) => {
    console.log("message from worker: ", event);
});

document.body.style.backgroundColor = "black";
const canvas = document.createElement("canvas");
canvas.style.backgroundColor = "white";
canvas.width = 600;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;
let alpha = 0.0;

const websocket = new WebSocket("ws://127.0.0.1:8080/game");
websocket.binaryType = "arraybuffer";

websocket.onopen = () => {
    console.log("sending");
    canvas.addEventListener("mousemove", (event) => {
        alpha += event.movementX / 20;
        if (Math.abs(alpha) > Math.PI) {
            alpha += (alpha < 0 ? 2 : -2) * Math.PI;
        }
        let buffer = new ArrayBuffer(8);
        let view = new DataView(buffer);
        view.setFloat64(0, alpha, false);
        websocket.send(buffer);
    });
};

websocket.onmessage = (e) => {
    console.log("data received");
    // let chunk = new SnakeChunk(e.data);
    // chunk.draw(ctx, 100, 300);
};

websocket.onclose = (e) => {
    console.log("closed");
};

Renderer.test();
