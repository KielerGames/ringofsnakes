import { MessageFromMain, ConnectToServer } from "../protocol/main-worker";
import {
    ClientToServerMessage,
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol/client-server";
import { transferAll } from "../protocol/utils";

const ctx: Worker = self as any;

let websocket: WebSocket | undefined = undefined;
let targetAlpha = 0.0;
let wantsToBeFast = false;

// Respond to message from parent thread
ctx.addEventListener("message", (event) => {
    const msg = event.data as MessageFromMain;

    switch (msg.tag) {
        case "UpdateUserInput": {
            targetAlpha = msg.alpha;
            wantsToBeFast = msg.fast;
            sendInputs();
            break;
        }
        case "ConnectToServer": {
            const request = msg as ConnectToServer;
            websocket = new WebSocket("ws://127.0.0.1:8080/game");
            websocket.binaryType = "arraybuffer";
            //websocket.onmessage = handleServerMessageEvent;
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
        default: {
            // @ts-ignore
            console.warn(`Unknown message from main thread. (${msg.tag})`);
        }
    }
});

function sendInputs(): void {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        let buffer = new ArrayBuffer(10);
        let view = new DataView(buffer);
        view.setFloat64(0, targetAlpha, false);
        view.setUint8(8, wantsToBeFast ? 1 : 0);
        view.setUint8(9, 42);
        websocket!.send(buffer);
    }
}
