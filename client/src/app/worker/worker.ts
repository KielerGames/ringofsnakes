import * as Comlink from "comlink";
import { ClientConfig } from "../data/config/ClientConfig";
import { connect, Socket } from "./socket";
import RateLimiter from "../util/RateLimiter";
import GameDataBuffer from "./data/GameDataBuffer";
import { ClientData } from "./data/ClientData";
import { Callback } from "../util/FunctionTypes";
import { SpawnInfo } from "./data/JSONMessages";
import Rectangle, { TransferableBox } from "../math/Rectangle";
import { DataUpdateDTO } from "../data/dto/DataUpdateDTO";
import { GameInfoDTO } from "../data/dto/GameInfoDTO";

type WorkerEvent = "server-update" | "error" | "disconnect";

let socket: Socket | null = null;

const userInputRateLimiter = new RateLimiter<ClientData>(1000 / 30, (data) => {
    if (socket && socket.isOpen()) {
        const buffer = new ArrayBuffer(9);
        const view = new DataView(buffer);
        const box = Rectangle.fromTransferable(data.viewBox);
        view.setFloat32(0, box.width / box.height, false);
        view.setFloat32(4, data.targetAlpha, false);
        view.setUint8(8, data.wantsToBeFast ? 1 : 0);
        socket.sendBinary(buffer);
    }
});

const data = new GameDataBuffer();

const eventListeners = new Map<WorkerEvent, Callback>();

export class WorkerAPI {
    async init(name: string, cfg: Readonly<ClientConfig>): Promise<GameInfoDTO> {
        if (socket !== null) {
            throw new Error("Worker is already initialized.");
        }

        const protocol = cfg.server.wss ? "wss" : "ws";
        const url = `${protocol}://${cfg.server.host}:${cfg.server.port}/game`;
        socket = await connect(url);

        const spawnInfo: SpawnInfo = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject("SpawnInfo timeout."), 2000);

            socket!.onJSONMessage = (message) => {
                if (message.tag === "SpawnInfo") {
                    clearTimeout(timeoutId);
                    resolve(message);
                } else {
                    console.warn(`Game init: Unexpected message from server.`, message);
                }
            };
        });

        data.init(spawnInfo);

        socket.onJSONMessage = (message) => {
            switch (message.tag) {
                default: {
                    data.addJSONUpdate(message);
                }
            }
            triggerEvent("server-update");
        };

        socket.onBinaryMessage = (message) => {
            data.addBinaryUpdate(message);
            triggerEvent("server-update");
        };

        socket.onclose = () => {
            triggerEvent("disconnect");
            self.close();
        };

        socket.sendJSON({ tag: "UpdatePlayerName", name });

        return {
            config: data.config,
            targetSnakeId: spawnInfo.snakeId,
            startPosition: { x: 0, y: 0 } // TODO
        };
    }

    async sendUserInput(alpha: number, wantsFast: boolean, viewBox: TransferableBox) {
        userInputRateLimiter.setValue({
            targetAlpha: alpha,
            wantsToBeFast: wantsFast,
            viewBox
        });
    }

    getDataChanges(): DataUpdateDTO {
        const update = data.nextUpdate();

        // avoid copying of ArrayBuffers
        // instead move/transfer them to the main thread
        const transferables: ArrayBuffer[] = update.snakeChunks.map((chunk) => chunk.data.buffer);

        if (update.heatMap) {
            transferables.push(update.heatMap.buffer);
        }

        return Comlink.transfer(update, transferables);
    }

    quit(): void {
        if (socket) {
            socket.close();
        }
        self.close();
    }

    addEventListener(eventId: WorkerEvent, callback: Callback): void {
        eventListeners.set(eventId, callback);
    }
}

function triggerEvent(event: WorkerEvent): void {
    const listener = eventListeners.get(event);

    if (listener) {
        listener();
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onerror = (event, source, lineno, colno, error) => {
    // TODO
    triggerEvent("error");
};

Comlink.expose(new WorkerAPI());
