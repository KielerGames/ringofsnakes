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

    init(spawnInfo: SpawnInfo): void {
        this.config = spawnInfo.gameConfig;
    }

    nextUpdate(): DataUpdateDTO {
        const dataUpdate = this.updateQueue.shift();
        const moreUpdates = this.updateQueue.length > 0;

        const leaderboard = this.leaderboard;
        this.leaderboard = undefined;

        const snakeDeaths = this.snakeDeaths;
        this.snakeDeaths = [];

        return {
            ticksSinceLastUpdate: dataUpdate ? dataUpdate.ticksSinceLastUpdate : 0,
            snakes: dataUpdate ? dataUpdate.snakeInfos : [],
            snakeChunks: dataUpdate ? dataUpdate.snakeChunkData : [],
            foodChunks: dataUpdate ? dataUpdate.foodChunkData : [],
            snakeDeaths,
            leaderboard,
            moreUpdates
        };
    }

    addBinaryUpdate(buffer: ArrayBuffer): void {
        const update = GameUpdateDecoder.decode(this.config, buffer);
        this.updateQueue.push(update);
    }

    addJSONUpdate(update: ServerToClientJSONMessage): void {
        switch (update.tag) {
            case "SnakeDeathInfo": {
                console.info(`Snake ${update.snakeId} has died.`);
                this.snakeDeaths.push(update.snakeId);
                break;
            }
            case "Leaderboard": {
                this.leaderboard = {
                    list: update.list
                };
                break;
            }
            default: {
                throw new Error(`Unexpected message from server. (tag = ${update.tag})`);
            }
        }
    }
}

type SnakeId = number;
