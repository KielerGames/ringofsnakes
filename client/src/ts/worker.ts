import * as SCD from "./worker/SnakeChunkDecoder";
import { MessageFromMain, ConnectToServer } from "./protocol/main-worker";
import { ClientToServerMessage } from "./protocol/client-server";

const ctx: Worker = self as any;

let websocket: WebSocket | undefined = undefined;
let targetAlpha = 0.0;

// Respond to message from parent thread
ctx.addEventListener("message", (event) => {
    const msg = event.data as MessageFromMain;

    switch (msg.tag) {
        case "UpdateTargetAlpha": {
            targetAlpha = msg.alpha;
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                //TODO
                let buffer = new ArrayBuffer(8);
                let view = new DataView(buffer);
                view.setFloat64(0, targetAlpha, false);
                websocket!.send(buffer);
            }
            break;
        }
        case "ConnectToServer": {
            const request = msg as ConnectToServer;
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
        case "RunTest": {
            setTimeout(test, 1000);
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

function test(): void {
    const chunkData = SCD.test();
    // transfer data to main thread (including ownership of data.glVertexBuffer)
    ctx.postMessage({ tag: "SnakeChunkData", data: chunkData }, [
        chunkData.glVertexBuffer,
    ]);
}
