import { ClientToServerJSONMessage, ServerToClientJSONMessage } from "./data/JSONMessages";

export interface Socket {
    onclose: () => void;
    onJSONMessage: (message: ServerToClientJSONMessage) => void;
    onBinaryMessage: (message: ArrayBuffer) => void;
    readonly sendJSON: (message: ClientToServerJSONMessage) => void;
    readonly sendBinary: (message: ArrayBuffer) => void;
    readonly close: () => void;
    readonly isOpen: () => boolean;
}

class SocketImpl implements Socket {
    private websocket: WebSocket;
    onclose = () => {};
    onJSONMessage = (message: ServerToClientJSONMessage) => {};
    onBinaryMessage = (data: ArrayBuffer) => {};

    constructor(websocket: WebSocket) {
        this.websocket = websocket;
        this.websocket.onclose = (e: CloseEvent) => {
            const { code, reason, wasClean } = e;
            console.info("WebSocket closed", code, reason, wasClean);
            this.onclose();
        };
        this.websocket.onerror = () => console.error("WebSocket error");
        this.websocket.onmessage = (e: MessageEvent<string | ArrayBuffer>) => {
            const data = e.data;

            if (data instanceof ArrayBuffer) {
                this.onBinaryMessage(data);
            } else {
                const object = JSON.parse(data);
                this.onJSONMessage(object);
            }
        };
    }

    sendJSON(message: ClientToServerJSONMessage) {
        this.websocket.send(JSON.stringify(message));
    }

    sendBinary(message: ArrayBuffer) {
        this.websocket.send(message);
    }

    close() {
        if (this.websocket.readyState !== WebSocket.CLOSED) {
            this.websocket.close();
        }
    }

    isOpen() {
        return this.websocket.readyState === WebSocket.OPEN;
    }
}

export async function connect(url: string): Promise<Socket> {
    const websocket = new WebSocket(url);
    websocket.binaryType = "arraybuffer";

    await new Promise<void>((resolve, reject) => {
        websocket.onopen = () => {
            websocket.onopen = null;
            resolve();
        };

        websocket.onerror = () => {
            websocket.onerror = null;
            reject();
        };
    });

    if (__DEBUG__) {
        console.info(`Connected to ${url}.`);
    }

    return new SocketImpl(websocket);
}
