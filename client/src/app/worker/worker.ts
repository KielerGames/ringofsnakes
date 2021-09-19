import * as Comlink from "comlink";
import Rectangle, { TransferableBox } from "../math/Rectangle";
import {
    ClientToServerMessage,
    GameConfig,
    ServerToClientJSONMessage
} from "../protocol";
import { GameDataUpdate } from "./GameDataUpdate";
import WorkerGame from "./WorkerGame";

let game: WorkerGame | null = null;

export class WorkerAPI {
    public async init(name: string): Promise<void> {
        const websocket = new WebSocket("ws://127.0.0.1:8080/game");
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

    public getGameDataUpdate(): GameDataUpdate {
        if (game === null) {
            throw new Error("Not initialized.");
        }

        const update = game.getDataUpdate();
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
