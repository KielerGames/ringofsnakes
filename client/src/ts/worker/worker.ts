import * as Comlink from "comlink";
import {
    ClientToServerMessage,
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol/client-server";

let websocket: WebSocket | undefined = undefined;
let targetAlpha = 0.0;
let wantsToBeFast = false;

export class WorkerAPI {
    public init(name: string):void {
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
                    name,
                } as ClientToServerMessage)
            );
        };
    }

    public updateUserInput(alpha: number, fast: boolean):void {
        targetAlpha = alpha;
        wantsToBeFast = fast;
        sendInputs();
    }

    public requestFrameData(time: number): any {
        return null; //TODO
    }
}

Comlink.expose(WorkerAPI);

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
