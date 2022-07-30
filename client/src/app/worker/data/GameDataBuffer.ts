import { GameConfig } from "../../data/config/GameConfig";
import { ServerToClientJSONMessage, SpawnInfo } from "./JSONMessages";
import * as GameUpdateDecoder from "../decoder/GameUpdateDecoder";
import { DataUpdateDTO } from "../../data/dto/DataUpdateDTO";

/**
 * A buffer for updates send from the server to the client.
 * Worker thread only.
 */
export default class GameDataBuffer {
    config: GameConfig;

    private updateQueue: QueuedUpdate[] = [];
    private snakeNames = new Map<SnakeId, string>();

    init(spawnInfo: SpawnInfo): void {
        this.config = spawnInfo.gameConfig;
        this.snakeNames.set(spawnInfo.snakeId, spawnInfo.snakeName);
    }

    nextUpdate(): DataUpdateDTO {
        const queuedUpdate = this.updateQueue.shift();
        const moreUpdates = this.updateQueue.length > 0;

        if (queuedUpdate) {
            // set snake name field if that data is available
            queuedUpdate.snakes.forEach((si) => (si.name = this.snakeNames.get(si.id)));
        }

        return {
            ...createEmptyUpdate(),
            ...queuedUpdate,
            moreUpdates
        };
    }

    addBinaryUpdate(buffer: ArrayBuffer): void {
        const data = GameUpdateDecoder.decode(this.config, buffer);

        if (data.ticksSinceLastUpdate <= 0) {
            console.error(`Binary update not supported! ticks: ${data.ticksSinceLastUpdate}`);
        }

        const enhance =
            this.updateQueue.length > 0 &&
            this.updateQueue[this.updateQueue.length - 1].ticksSinceLastUpdate === 0;

        const update = enhance
            ? this.updateQueue[this.updateQueue.length - 1]
            : createEmptyUpdate();

        update.ticksSinceLastUpdate = data.ticksSinceLastUpdate;
        update.snakes.push(...data.snakeInfos);
        update.snakeChunks.push(...data.snakeChunkData);
        update.foodChunks.push(...data.foodChunkData);

        if (data.heatMap) {
            update.heatMap = data.heatMap;
        }

        if (!enhance) {
            this.updateQueue.push(update);
        }

        if (this.duration > 0.5) {
            console.warn(`Update congestion! Current delay: ${this.duration.toFixed(2)}s`);
        }
    }

    addJSONUpdate(update: ServerToClientJSONMessage): void {
        switch (update.tag) {
            case "SnakeDeathInfo": {
                console.info(`Snake ${update.snakeId} has died.`);
                this.addInformation({
                    snakeDeaths: [update.snakeId]
                });
                this.snakeNames.delete(update.snakeId);
                break;
            }
            case "Leaderboard": {
                this.addInformation({
                    leaderboard: { list: update.list }
                });
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

    /**
     * The total duration of the update queue in seconds.
     */
    get duration(): number {
        return (
            this.config.tickDuration *
            this.updateQueue.map((update) => update.ticksSinceLastUpdate).reduce((a, b) => a + b, 0)
        );
    }

    private addInformation(data: Partial<QueuedUpdate>): void {
        let update: QueuedUpdate;

        if (this.updateQueue.length === 0) {
            update = createEmptyUpdate();
            this.updateQueue.push(update);
        } else {
            update = this.updateQueue[this.updateQueue.length - 1];
        }

        if (data.leaderboard) {
            update.leaderboard = data.leaderboard;
        }

        if (data.snakeDeaths) {
            update.snakeDeaths.push(...data.snakeDeaths);
        }
    }
}

function createEmptyUpdate(): QueuedUpdate {
    return {
        ticksSinceLastUpdate: 0,
        snakes: [],
        snakeChunks: [],
        foodChunks: [],
        snakeDeaths: []
    };
}

type SnakeId = number;

type QueuedUpdate = Omit<DataUpdateDTO, "moreUpdates">;
