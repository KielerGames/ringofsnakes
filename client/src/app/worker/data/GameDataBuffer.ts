import { GameConfig } from "../../data/config/GameConfig";
import { LeaderboardDTO } from "../../data/dto/Leaderboard";
import { DecodedGameUpdate } from "../decoder/GameUpdateDecoder";
import { ServerToClientJSONMessage, SpawnInfo } from "./JSONMessages";
import * as GameUpdateDecoder from "../decoder/GameUpdateDecoder";
import { DataUpdateDTO } from "../../data/dto/DataUpdateDTO";

/**
 * A buffer for updates send from the server to the client.
 * Worker thread only.
 */
export default class GameDataBuffer {
    config: GameConfig;

    private leaderboard: LeaderboardDTO | undefined;
    private updateQueue: DecodedGameUpdate[] = [];
    private snakeDeaths: SnakeId[] = [];
    private snakeNames = new Map<SnakeId, string>();

    init(spawnInfo: SpawnInfo): void {
        this.config = spawnInfo.gameConfig;
        this.snakeNames.set(spawnInfo.snakeId, spawnInfo.snakeName);
    }

    nextUpdate(): DataUpdateDTO {
        if (this.updateQueue.length === 0) {
            throw new Error("No game update available.");
        }
        
        const dataUpdate = this.updateQueue.shift();
        const moreUpdates = this.updateQueue.length > 0;

        const leaderboard = this.leaderboard;
        this.leaderboard = undefined;

        const snakeDeaths = this.snakeDeaths;
        this.snakeDeaths = [];

        if (dataUpdate) {
            // set snake name field if that data is available
            dataUpdate.snakeInfos.forEach((si) => (si.name = this.snakeNames.get(si.id)));
        }

        return {
            ticksSinceLastUpdate: dataUpdate ? dataUpdate.ticksSinceLastUpdate : 0,
            snakes: dataUpdate ? dataUpdate.snakeInfos : [],
            snakeChunks: dataUpdate ? dataUpdate.snakeChunkData : [],
            foodChunks: dataUpdate ? dataUpdate.foodChunkData : [],
            snakeDeaths,
            leaderboard,
            heatMap: dataUpdate?.heatMap,
            moreUpdates
        };
    }

    addBinaryUpdate(buffer: ArrayBuffer): void {
        const update = GameUpdateDecoder.decode(this.config, buffer);
        this.updateQueue.push(update);

        if (this.duration > 0.5) {
            console.warn(`Update congestion! Current delay: ${this.duration.toFixed(2)}s`);
        }
    }

    addJSONUpdate(update: ServerToClientJSONMessage): void {
        switch (update.tag) {
            case "SnakeDeathInfo": {
                console.info(`Snake ${update.snakeId} has died.`);
                this.snakeDeaths.push(update.snakeId);
                this.snakeNames.delete(update.snakeId);
                break;
            }
            case "Leaderboard": {
                this.leaderboard = {
                    list: update.list
                };
                update.list.forEach(({ id, name }) => this.snakeNames.set(id, name));
                break;
            }
            case "SnakeNameUpdate": {
                for (const [strId, name] of Object.entries(update.names)) {
                    const id = parseInt(strId, 10);
                    this.snakeNames.set(id, name);
                }
                break;
            }
            default: {
                throw new Error(`Unexpected message from server. (tag = ${update.tag})`);
            }
        }
    }

    get duration(): number {
        return (
            this.config.tickDuration *
            this.updateQueue.map((update) => update.ticksSinceLastUpdate).reduce((a, b) => a + b, 0)
        );
    }
}

type SnakeId = number;
