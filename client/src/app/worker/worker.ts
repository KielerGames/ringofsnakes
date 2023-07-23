import * as Comlink from "comlink";
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
import { SpectatorChangeDTO } from "../data/dto/SpectatorChangeDTO";

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
    spectatorChange: new AppEvent<SpectatorChangeDTO>()
};

const data = new GameDataBuffer(triggerServerUpdateEvent);

const api = {
    async init(server: string): Promise<GameInfoDTO> {
        if (socket !== null) {
            throw new Error("Worker is already initialized.");
        }

        console.info(`Connecting to ${server}`);
        socket = await connect(server);

        const gameInfo: GameInfo = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error("GameInfo timeout.")), 1500);

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
                    events.spectatorChange.trigger(message);
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
            startPosition: gameInfo.startPosition,
            recording: gameInfo.recordingEnabled
        };
    },

    sendUserInput(alpha: number, wantsFast: boolean, viewBox: TransferableBox): void {
        userInputRateLimiter.setValue({
            targetAlpha: alpha,
            wantsToBeFast: wantsFast,
            viewBox
        });
    },

    getDataChanges(): DataUpdateDTO {
        const update = data.nextUpdate();

        // avoid copying of ArrayBuffers
        // instead move/transfer them to the main thread
        const transferables: ArrayBuffer[] = [
            ...update.snakeChunks.map((chunk) => chunk.data.buffer),
            ...update.foodChunks.map((chunk) => chunk.vertexBuffer)
        ];

        if (update.heatMap) {
            transferables.push(update.heatMap.buffer);
        }

        return Comlink.transfer(update, transferables);
    },

    quit(): void {
        if (socket) {
            socket.close();
        }
        self.close();
    },

    addEventListener(eventName: EventWithoutPayloadName, listener: Consumer<void>): void {
        events[eventName].addListener(listener);
    },

    // TS does not support method overloads with mapped types. Therefore Comlink cannot
    // properly expose a properly typed addEventListener(event, listener) method.
    // If the number of events increases we should consider auto-generating these methods:
    onError(listener: Consumer<string>): void {
        events.error.addListener(listener);
    },

    onSpectatorChange(listener: Consumer<SpectatorChangeDTO>): void {
        events.spectatorChange.addListener(listener);
    }
};

function triggerServerUpdateEvent() {
    events.serverUpdate.trigger();
}

export type WorkerAPI = Readonly<typeof api>;

type EventName = keyof typeof events;
//type EventListener<E extends EventName> = Parameters<(typeof events)[E]["addListener"]>[0];
//type EventPayload<E extends EventName> = Parameters<EventListener<E>>[0];
type EventWithoutPayloadName = Exclude<EventName, "error" | "spectatorChange">; // TODO: auto generate

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onerror = (event, source, lineno, colno, error) => {
    // TODO
    events.error.trigger(event.toString());
};

Comlink.expose(api);
