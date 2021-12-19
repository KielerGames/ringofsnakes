import * as Comlink from "comlink";
import { ClientConfig } from "../data/ClientConfig";
import Rectangle, { TransferableBox } from "../math/Rectangle";
import { ClientToServerMessage, ServerToClientJSONMessage } from "../protocol";
import { GameConfig } from "../types/GameConfig";
import { MainThreadGameDataUpdate } from "./MainThreadGameDataUpdate";
import WorkerGame from "./WorkerGame";

let game: WorkerGame | null = null;

export class WorkerAPI {
    public async init(
        name: string,
        cfg: Readonly<ClientConfig>
    ): Promise<void> {
        const protocol = cfg.server.wss ? "wss" : "ws";
        const websocket = new WebSocket(
            `${protocol}://${cfg.server.host}:${cfg.server.port}/game`
        );
        websocket.binaryType = "arraybuffer";

        await new Promise<void>((resolve) => {
            websocket.onopen = () => {
                websocket.onopen = null;
                resolve();
            };
        });

        console.info("Connection open.");

        game = await new Promise((resolve) => {
            websocket.onmessage = (event: MessageEvent) => {
                if (typeof event.data === "string") {
                    const json = JSON.parse(
                        event.data
                    ) as ServerToClientJSONMessage;
                    if (json.tag === "SpawnInfo") {
                        websocket.onmessage = null;
                        resolve(
                            new WorkerGame(
                                websocket,
                                json.snakeId,
                                json.gameConfig
                            )
                        );
                        // this was the expected message
                        return;
                    }
                }

                console.warn(
                    `Game init: Unexpected websocket message from server. (${typeof event.data})`
                );
            };

            websocket.send(
                JSON.stringify({
                    tag: "UpdatePlayerName",
                    name
                } as ClientToServerMessage)
            );
        });

        await game?.binaryDataReceived.wait();

        console.info(`WorkerGame init complete.`);
    }

    public updateUserData(
        alpha: number,
        wantsFast: boolean,
        viewBox: TransferableBox
    ): void {
        if (game) {
            game.updateUserData(
                alpha,
                wantsFast,
                Rectangle.fromTransferable(viewBox)
            );
        }
    }

    public getGameDataUpdate(): MainThreadGameDataUpdate {
        if (game === null) {
            throw new Error("Not initialized.");
        }

        const update = game.getDataChanges();
        const transferables = update.newSnakeChunks.map(
            (chunk) => chunk.data.buffer
        );

        return Comlink.transfer(update, transferables);
    }

    public getConfig(): GameConfig {
        if (!game) {
            throw new Error("No game config. (Game not fully initialized)");
        }
        return game.config;
    }

    public onEnd(callback: () => void): void {
        if (game === null) {
            throw new Error("No game.");
        }

        game.socket.addEventListener("close", callback);
    }

    public quitCurrentGame(): void {
        if (game) {
            game.socket.close();
        }
    }
}

Comlink.expose(new WorkerAPI());
