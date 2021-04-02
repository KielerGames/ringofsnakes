import {
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol/client-server";
import assert from "../utilities/assert";
import * as GUD from "./decoder/GameUpdateDecoder";
import WorkerChunk from "./WorkerChunk";
import WorkerSnake from "./WorkerSnake";

export default class WorkerGame {
    socket: WebSocket;

    targetPlayerId: number;
    config: GameConfig;
    chunks: Map<ChunkId, WorkerChunk> = new Map();
    snakes: Map<SnakeId, WorkerSnake> = new Map();

    targetAlpha: number = 0.0;
    wantsToBeFast: boolean = false;

    constructor(socket: WebSocket, snakeId: number, gameConfig: GameConfig) {
        this.socket = socket;
        this.config = gameConfig;
        this.targetPlayerId = snakeId;

        assert(socket.readyState === WebSocket.OPEN);
        assert(socket.binaryType === "arraybuffer");

        socket.onmessage = this.onMessageFromServer.bind(this);
        socket.onclose = () => console.log("Connection closed.");
    }

    private onMessageFromServer(event: MessageEvent) {
        const rawData = event.data as ArrayBuffer | string;

        if (rawData instanceof ArrayBuffer) {
            const data = GUD.decode(this.config, rawData);

            data.chunkData.forEach((chunkData) => {
                let chunk = this.chunks.get(chunkData.chunkId);
                if (chunk) {
                    // update chunk
                } else {
                    const snake = this.snakes.get(chunkData.snakeId);
                    assert(snake !== undefined);
                    chunk = new WorkerChunk(snake!, chunkData);
                    this.chunks.set(chunkData.chunkId, chunk);
                }
            });
        } else {
            const json = JSON.parse(rawData) as ServerToClientJSONMessage;

            switch (json.tag) {
                // case "SpawnInfo": {
                //     break;
                // }
                default: {
                    throw new Error(
                        `Unknown message from server. (tag = ${json.tag})`
                    );
                }
            }
        }
    }

    public updateUserInput(alpha: number, fast: boolean): void {
        this.targetAlpha = alpha;
        this.wantsToBeFast = fast;

        // send to server
        const ws = this.socket;
        if (ws.readyState === WebSocket.OPEN) {
            let buffer = new ArrayBuffer(10);
            let view = new DataView(buffer);
            view.setFloat64(0, this.targetAlpha, false);
            view.setUint8(8, this.wantsToBeFast ? 1 : 0);
            view.setUint8(9, 42);
            ws.send(buffer);
        }
    }
}

type ChunkId = number;
type SnakeId = number;
