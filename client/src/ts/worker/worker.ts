import * as SCD from "./SnakeChunkDecoder";
import { MessageFromMain, ConnectToServer } from "../protocol/main-worker";
import { ClientToServerMessage, GameConfig, ServerToClientJSONMessage } from "../protocol/client-server";

const ctx: Worker = self as any;

let websocket: WebSocket | undefined = undefined;
let targetAlpha = 0.0;
let gameConfig:GameConfig|undefined = undefined;

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
        default: {
            // @ts-ignore
            console.warn(`Unknown message from main thread. (${msg.tag})`);
        }
    }
});

function handleServerMessageEvent(event: MessageEvent): void {
    const data = event.data as ArrayBuffer | string;

    if (data instanceof ArrayBuffer) {
        if(gameConfig === undefined) {
            throw new Error("GameConfig not yet defined.");
        }

        const chunkData = SCD.decode(gameConfig, data);
        // transfer data to main thread (including ownership of data.glVertexBuffer)
        ctx.postMessage({ tag: "SnakeChunkData", data: chunkData }, [
            chunkData.glVertexBuffer,
        ]);
    } else {
        const msg = JSON.parse(data) as ServerToClientJSONMessage;
        
        switch(msg.tag) {
            case "SpawnInfo": {
                console.log("Spawn info: ", msg);
                gameConfig = msg.gameConfig;
                break;
            }
            default: {
                throw new Error(`Unknown message from server. (tag = ${msg.tag})`);
            }
        }
    }
}

