import { GameConfig, ServerToClientJSONMessage } from "../protocol";
import assert from "../utilities/assert";
import * as GUD from "./decoder/GameUpdateDecoder";
import { SnakeChunkData, SnakeData, GameDataUpdate } from "./GameDataUpdate";
import WorkerSnakeChunk from "./WorkerSnakeChunk";
import WorkerSnake from "./WorkerSnake";
import { FoodChunkDTO, FoodChunkId } from "./decoder/FoodDecoder";
import Rectangle from "../math/Rectangle";

export default class WorkerGame {
    socket: WebSocket;

    readonly config: Readonly<GameConfig>;
    targetPlayerId: number;

    readonly snakes: Map<SnakeId, WorkerSnake> = new Map();
    readonly snakeChunks: Map<SnakeChunkId, WorkerSnakeChunk> = new Map();
    readonly foodChunks: Map<FoodChunkId, FoodChunkDTO> = new Map();

    lastServerUpdateTime: number;
    ticksSinceLastMainThreadUpdate: number = 0;

    targetAlpha: number = 0.0;
    wantsToBeFast: boolean = false;
    private viewBox: Rectangle;

    constructor(socket: WebSocket, snakeId: number, gameConfig: GameConfig) {
        this.socket = socket;
        this.config = gameConfig;
        this.targetPlayerId = snakeId;

        assert(socket.readyState === WebSocket.OPEN);
        assert(socket.binaryType === "arraybuffer");

        socket.onclose = () => console.log("Connection closed.");
        socket.onerror = (e) => console.error(e);
        socket.onmessage = (event: MessageEvent) => {
            const rawData = event.data as ArrayBuffer | string;

            if (rawData instanceof ArrayBuffer) {
                this.onBinaryMessageFromServer(rawData);
            } else {
                this.onJsonMessageFromServer(
                    JSON.parse(rawData) as ServerToClientJSONMessage
                );
            }
        };

        this.lastServerUpdateTime = performance.now();

        console.log(`target snake id: ${snakeId}`);
    }

    private onBinaryMessageFromServer(binaryData: Readonly<ArrayBuffer>): void {
        const data = GUD.decode(this.config, binaryData);

        // update snakes
        data.snakeInfos.forEach((info) => {
            const snake = this.snakes.get(info.snakeId);
            if (snake) {
                snake.updateFromServer(info);
            } else {
                this.snakes.set(
                    info.snakeId,
                    new WorkerSnake(info, this.config)
                );
            }
        });

        // update snake chunks
        data.snakeChunkData.forEach((chunkData) => {
            let chunk = this.snakeChunks.get(chunkData.chunkId);
            if (chunk) {
                chunk.update(chunkData);
            } else {
                const snake = this.snakes.get(chunkData.snakeId);
                assert(snake !== undefined, "Data for unknown snake.");
                chunk = new WorkerSnakeChunk(snake!, chunkData);
                this.snakeChunks.set(chunkData.chunkId, chunk);
            }
        });

        // update food chunks
        data.foodChunkData.forEach((chunk) => {
            this.foodChunks.set(chunk.id, chunk);
        });

        this.ticksSinceLastMainThreadUpdate++;
        this.lastServerUpdateTime = performance.now();
    }

    private onJsonMessageFromServer(
        json: Readonly<ServerToClientJSONMessage>
    ): void {
        switch (json.tag) {
            // TODO
            default: {
                throw new Error(
                    `Unexpected message from server. (tag = ${json.tag})`
                );
            }
        }
    }

    public updateUserData(
        alpha: number,
        wantsFast: boolean,
        viewBox: Rectangle
    ): void {
        this.targetAlpha = alpha;
        this.wantsToBeFast = wantsFast;
        this.viewBox = viewBox;

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

        if (player) {
            return player.position.createTransferable();
        } else {
            console.warn(`No snake info for ${this.targetPlayerId}`);
            return { x: 0, y: 0 };
        }
    }

    public getDataUpdate(): GameDataUpdate {
        const snakeChunks: SnakeChunkData[] = new Array(this.snakeChunks.size);
        const snakes: SnakeData[] = new Array(this.snakes.size);

        // snake chunk updates
        {
            let i = 0;
            const gc: number[] = [];
            for (const chunk of this.snakeChunks.values()) {
                snakeChunks[i] = chunk.createTransferData();
                if (snakeChunks[i].final) {
                    gc.push(snakeChunks[i].id);
                }
                i++;
            }

            // garbage-collect chunks
            gc.forEach((chunkId) => this.snakeChunks.delete(chunkId));
        }

        // snake updates
        {
            let i = 0;
            for (const snake of this.snakes.values()) {
                snakes[i] = snake.createTransferData();
                i++;
            }
            // TODO: gc snakes
        }

        // food updates
        const foodChunks = Array.from(this.foodChunks.values());
        this.foodChunks.clear();

        const ticks = this.ticksSinceLastMainThreadUpdate;
        this.ticksSinceLastMainThreadUpdate = 0;

        return {
            timeSinceLastTick: performance.now() - this.lastServerUpdateTime,
            ticksSinceLastMainThreadUpdate: ticks,
            newSnakeChunks: snakeChunks,
            snakes,
            foodChunks,
            targetSnakeId: this.targetPlayerId
        };
    }
}

type SnakeChunkId = number;
type SnakeId = number;
