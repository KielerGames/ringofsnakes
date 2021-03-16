import {
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol/client-server";
import assert from "../utilities/assert";
import * as GUD from "./decoder/GameUpdateDecoder";
import NonFinalChunk from "./NonFinalChunk";
import Snake from "./Snake";

export default class Game {
    socket: WebSocket;

    targetPlayerId: number;
    config: GameConfig;
    chunks: Map<UniqueChunkId, NonFinalChunk> = new Map();
    fullChunks: Map<UniqueChunkId, NonFinalChunk> = new Map();
    snakes: Map<SnakeId, Snake> = new Map();

    constructor(socket: WebSocket, gameConfig: GameConfig) {
        this.socket = socket;
        this.config = gameConfig;

        assert(socket.readyState === WebSocket.OPEN);
        assert(socket.binaryType === "arraybuffer");

        socket.onmessage = this.onMessageFromServer.bind(this);
    }

    private onMessageFromServer(event: MessageEvent) {
        const rawData = event.data as ArrayBuffer | string;

        if (rawData instanceof ArrayBuffer) {
            const data = GUD.decode(this.config, rawData);
        } else {
            const json = JSON.parse(rawData) as ServerToClientJSONMessage;

            switch(json.tag) {
                case "SpawnInfo": {
                    break;
                }
                default: {
                    throw new Error(
                        `Unknown message from server. (tag = ${json.tag})`
                    );
                }
            }
        }
    }
}

type UniqueChunkId = number;
type SnakeId = number;
