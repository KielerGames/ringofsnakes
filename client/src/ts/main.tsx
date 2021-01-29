const websocket = new WebSocket("ws://127.0.0.1:8080/game");
websocket.binaryType = "arraybuffer";

websocket.onopen = () => {
    document.body.innerHTML = "";
    websocket.send("hello");
};

websocket.onmessage = e => {
    let arr = new Uint8Array(e.data);
    console.log("data received", arr);
};

websocket.onclose = e => {
    console.log("closed");
}
