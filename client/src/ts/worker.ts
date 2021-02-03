import * as SCD from "./SnakeChunkDecoder";
import { MessageFromMain, ConnectRequest } from "./protocol/main-worker";
import { ClientToServerMessage } from "./protocol/client-server";

const ctx: Worker = self as any;

let websocket: WebSocket | undefined = undefined;

// Respond to message from parent thread
ctx.addEventListener("message", (event) => {
    const msg = event.data as MessageFromMain;

    switch (msg.tag) {
        case "ConnectRequest": {
            const request = msg as ConnectRequest;
            websocket = new WebSocket("ws://127.0.0.1:8080/game");
            websocket.binaryType = "arraybuffer";
            websocket.onmessage = handleServerMessageEvent;
            websocket.onclose = () => {
                console.log("Connection closed.");
                websocket = undefined;
            };
            websocket.onopen = () => {
                console.log("Connection open.");
                websocket!.send(
                    JSON.stringify({
                        tag: "UpdatePlayerName",
                        name: request.playerName,
                    } as ClientToServerMessage)
                );
            };
            break;
        }
    }
});

function handleServerMessageEvent(event: MessageEvent): void {
    const data = event.data as ArrayBuffer | string;

    if (data instanceof ArrayBuffer) {
        const chunkData = SCD.decode(data);
        // transfer data to main thread (including ownership of data.glVertexBuffer)
        ctx.postMessage({ tag: "SnakeChunkData", data: chunkData }, [
            chunkData.glVertexBuffer,
        ]);
    } else {
        const json = JSON.parse(data);
        console.log("Received JSON data: ", json);
    }
}
