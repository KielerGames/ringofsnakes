import * as Comlink from "comlink";
import { ClientConfig } from "../data/config/ClientConfig";
import { connect, Socket } from "./socket";
import RateLimiter from "../util/RateLimiter";
import GameDataBuffer from "./data/GameDataBuffer";
import { ClientData } from "./data/ClientData";
import { GameInfo } from "./data/JSONMessages";
import Rectangle, { TransferableBox } from "../math/Rectangle";
import { DataUpdateDTO } from "../data/dto/DataUpdateDTO";
import { GameInfoDTO } from "../data/dto/GameInfoDTO";
import { AppEvent } from "../util/AppEvent";
import { Consumer } from "../util/FunctionTypes";

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

const events = {
    serverUpdate: new AppEvent(),
    error: new AppEvent<string>(),
    disconnect: new AppEvent(),
    spectatorChange: new AppEvent<number>()
};

const data = new GameDataBuffer(triggerServerUpdateEvent);

const api = {
    init: async function init(cfg: Readonly<ClientConfig>): Promise<GameInfoDTO> {
        if (socket !== null) {
            throw new Error("Worker is already initialized.");
        }

        const protocol = cfg.server.wss ? "wss" : "ws";
        const url = `${protocol}://${cfg.server.host}:${cfg.server.port}/game`;
        socket = await connect(url);

        const gameInfo: GameInfo = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error("GameInfo timeout.")), 2000);

            socket!.onJSONMessage = (message) => {
                if (message.tag === "GameInfo") {
                    clearTimeout(timeoutId);
                    resolve(message);
                } else {
                    console.warn(`Game init: Unexpected message from server.`, message);
                }
            };
        });

        data.init(gameInfo);

        socket.onJSONMessage = (message) => {
            switch (message.tag) {
                case "SpectatorChange": {
                    events.spectatorChange.trigger(message.targetSnakeId); //TODO
                    break;
                }
                default: {
                    data.addJSONUpdate(message);
                }
            }
        };

        socket.onBinaryMessage = (message) => {
            data.addBinaryUpdate(message);
        };

        socket.onclose = () => {
            events.disconnect.trigger();
            self.close();
        };

        return {
            config: data.config,
            targetSnakeId: gameInfo.snakeId,
            startPosition: gameInfo.startPosition
        };
    },

    sendUserInput: function sendUserInput(
        alpha: number,
        wantsFast: boolean,
        viewBox: TransferableBox
    ): void {
        userInputRateLimiter.setValue({
            targetAlpha: alpha,
            wantsToBeFast: wantsFast,
            viewBox
        });
    },

    getDataChanges: function getDataChanges(): DataUpdateDTO {
        const update = data.nextUpdate();

        // avoid copying of ArrayBuffers
        // instead move/transfer them to the main thread
        const transferables: ArrayBuffer[] = update.snakeChunks.map((chunk) => chunk.data.buffer);

        if (update.heatMap) {
            transferables.push(update.heatMap.buffer);
        }

        return Comlink.transfer(update, transferables);
    },

    quit: function quit(): void {
        if (socket) {
            socket.close();
        }
        self.close();
    },

    addEventListener: function addEventListener<T>(
        event: keyof typeof events,
        callback: Consumer<T>
    ): void {
        events[event].addListener(callback as Consumer<unknown>);
    }
};

function triggerServerUpdateEvent() {
    events.serverUpdate.trigger();
}

export type WorkerAPI = Readonly<typeof api>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onerror = (event, source, lineno, colno, error) => {
    // TODO
    events.error.trigger(event.toString());
};

Comlink.expose(api);
