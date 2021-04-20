import { GameConfig, ServerToClientJSONMessage } from "../protocol";
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
    time: number;

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

        this.time = performance.now();

        console.log(`Snake id: ${snakeId}`);
    }

    private onMessageFromServer(event: MessageEvent) {
        const rawData = event.data as ArrayBuffer | string;

        if (rawData instanceof ArrayBuffer) {
            const data = GUD.decode(this.config, rawData);

            data.snakeInfos.forEach((info) => {
                const snake = this.snakes.get(info.snakeId);
                if (snake) {
                    snake.update(info);
                } else {
                    this.snakes.set(info.snakeId, new WorkerSnake(info));
                }
            });

            data.chunkData.forEach((chunkData) => {
                let chunk = this.chunks.get(chunkData.chunkId);
                if (chunk) {
                    chunk.update(chunkData);
                } else {
                    const snake = this.snakes.get(chunkData.snakeId);
                    assert(snake !== undefined, "Data for unknown snake.");
                    chunk = new WorkerChunk(snake!, chunkData);
                    this.chunks.set(chunkData.chunkId, chunk);
                }
            });

            this.time = performance.now();
        } else {
            const json = JSON.parse(rawData) as ServerToClientJSONMessage;

            switch (json.tag) {
                // TODO
                default: {
                    throw new Error(
                        `Unexpected message from server. (tag = ${json.tag})`
                    );
                }
            }
        }
    }

    public updateUserInput(alpha: number, fast: boolean): void {
        this.targetAlpha = alpha;
        this.wantsToBeFast = fast;

        // send to server
        // TODO: limit update rate
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

    public get cameraPosition(): { x: number; y: number } {
        const player = this.snakes.get(this.targetPlayerId);
        if(!player) {
            console.warn(`No snake info for ${this.targetPlayerId}`);
        }
        return player ? player.position.createTransferable() : { x: 0, y: 0 };
    }
}

type ChunkId = number;
type SnakeId = number;
