import { ServerToClientJSONMessage } from "../protocol";
import assert from "../utilities/assert";
import * as GUD from "./decoder/GameUpdateDecoder";
import {
    SnakeChunkData,
    SnakeDataDTO,
    MainThreadGameDataUpdate
} from "./MainThreadGameDataUpdate";
import WorkerSnakeChunk from "./WorkerSnakeChunk";
import WorkerSnake from "./WorkerSnake";
import { FoodChunkDTO, FoodChunkId } from "./decoder/FoodDecoder";
import Rectangle from "../math/Rectangle";
import { GameConfig } from "../types/GameConfig";
import { TopNList } from "../protocol";

export default class WorkerGame {
    socket: WebSocket;

    readonly config: GameConfig;
    targetPlayerId: number;

    readonly snakes: Map<SnakeId, WorkerSnake> = new Map();
    readonly snakeChunks: Map<SnakeChunkId, WorkerSnakeChunk> = new Map();
    readonly foodChunks: Map<FoodChunkId, FoodChunkDTO> = new Map();
    public topNList: TopNList;

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
                chunk.applyUpdateFromServer(chunkData);
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
            case "SnakeDeathInfo": {
                console.log(`Snake ${json.snakeId} has died.`);
                this.snakes.delete(json.snakeId);
                const snakeChunksToRemove: SnakeChunkId[] = [];
                this.snakeChunks.forEach((chunk) =>
                    snakeChunksToRemove.push(chunk.id)
                );
                snakeChunksToRemove.forEach((chunkId) =>
                    this.snakeChunks.delete(chunkId)
                );
                break;
            }
            case "TopNList": {
                this.topNList = json;
                console.log(this.topNList);
                break;
            }
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
            let buffer = new ArrayBuffer(9);
            let view = new DataView(buffer);
            view.setFloat32(0, this.viewBox.width / this.viewBox.height, false);
            view.setFloat32(4, this.targetAlpha, false);
            view.setUint8(8, this.wantsToBeFast ? 1 : 0);
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

    public getDataChanges(): MainThreadGameDataUpdate {
        const snakeChunks: SnakeChunkData[] = new Array(this.snakeChunks.size);
        const snakes: SnakeDataDTO[] = new Array(this.snakes.size);

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

            // garbage-collect snakes
            // TODO
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

    public getTopNList() : TopNList {
        return this.topNList;
    }
}

type SnakeChunkId = number;
type SnakeId = number;
