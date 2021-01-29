import SnakeChunk from "./SnakeChunk";

document.body.style.backgroundColor = "black";
const canvas = document.createElement("canvas");
canvas.style.backgroundColor = "white";
canvas.width = 600;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

const websocket = new WebSocket("ws://127.0.0.1:8080/game");
websocket.binaryType = "arraybuffer";

websocket.onopen = () => {
    websocket.send("hello");
};

websocket.onmessage = e => {
    console.log("data received");
    let chunk = new SnakeChunk(e.data);
    chunk.draw(ctx, 100, 300);
};

websocket.onclose = e => {
    console.log("closed");
}