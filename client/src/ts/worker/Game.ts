import {
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol/client-server";
import assert from "../utilities/assert";

export default class Game {
    socket: WebSocket;

    targetPlayerId: number;
    config: GameConfig;
    nonFinalChunks: any[];
    snakeInfos: any[];

    constructor(socket: WebSocket, gameConfig: GameConfig) {
        this.socket = socket;
        this.config = gameConfig;

        assert(socket.readyState === WebSocket.OPEN);
        assert(socket.binaryType === "arraybuffer");

        socket.onmessage = this.onMessageFromServer.bind(this);
    }

    private onMessageFromServer(event: MessageEvent) {
        const data = event.data as ArrayBuffer | string;

        if (data instanceof ArrayBuffer) {
        } else {
            const json = JSON.parse(data) as ServerToClientJSONMessage;
        }
    }
}
