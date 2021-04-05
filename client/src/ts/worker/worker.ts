import * as Comlink from "comlink";
import {
    ClientToServerMessage,
    GameConfig,
    ServerToClientJSONMessage,
} from "../protocol";
import { TickDataUpdate } from "./TickDataUpdate";
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
                    }
                }
                console.warn("Unexpected websocket message from server.");
            };

            websocket.send(
                JSON.stringify({
                    tag: "UpdatePlayerName",
                    name,
                } as ClientToServerMessage)
            );
        });

        console.info(`WorkerGame init complete.`);
    }

    public updateUserInput(alpha: number, fast: boolean): void {
        if (game) {
            game.updateUserInput(alpha, fast);
        }
    }

    public getNextTickData(): TickDataUpdate {
        return null as never; //TODO
    }

    public getConfig(): GameConfig {
        if(!game) {
            throw new Error("No game config. (Game not fully initialized)");
        }
        return game.config;
    }
}

Comlink.expose(WorkerAPI);
