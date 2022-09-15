import * as Comlink from "comlink";
import { WorkerAPI } from "../worker/worker";
import * as ClientConfig from "./config/ClientConfig";
import { GameConfig } from "./config/GameConfig";
import Camera from "./camera/Camera";
import Snake from "./snake/Snake";
import SnakeChunk from "./snake/SnakeChunk";
import { GameStatisticsDTO } from "./dto/GameStatisticsDTO";
import Vector from "../math/Vector";
import Player from "./Player";
import FoodChunk from "./world/FoodChunk";
import createRemote from "../worker/WorkerFactory";
import { ManagedMap } from "../util/ManagedMap";
import { SnakeDTO } from "./dto/SnakeDTO";
import { SnakeChunkDTO } from "./dto/SnakeChunkDTO";
import { FoodChunkDTO } from "./dto/FoodChunkDTO";
import { AppEvent } from "../util/AppEvent";
import { dialog } from "../ui/Dialogs";
import { SnakeDeathDTO } from "./dto/SnakeDeathDTO";
import { SpectatorChangeDTO } from "./dto/SpectatorChangeDTO";

export default class Game {
    readonly snakes: ManagedMap<SnakeDTO, SnakeId, Snake, number>;
    readonly snakeChunks: ManagedMap<SnakeChunkDTO, SnakeChunkId, SnakeChunk>;
    readonly foodChunks: ManagedMap<FoodChunkDTO, FoodChunkId, FoodChunk>;
    readonly events = {
        snakeDeath: new AppEvent<SnakeDeathDTO & { snake?: Snake }>(), // TODO
        gameEnd: new AppEvent<GameEndReason>()
    };

    camera: Camera = new Camera();
    statistics: GameStatisticsDTO = { leaderboard: [], numPlayers: 0, numBots: 0 };
    heatMap: Uint8Array;

    #remote: Comlink.Remote<WorkerAPI>;
    #config: GameConfig;
    #updateAvailable: boolean = false;
    #targetSnakeId: number | undefined;
    #targetSnakeKills: number = 0;
    #stopped: boolean = false;

    private constructor() {
        this.#remote = createRemote();
        this.snakes = new ManagedMap((dto) => new Snake(dto, this.#config));
        this.snakeChunks = new ManagedMap((dto) => {
            const snake = this.snakes.get(dto.snakeId);
            if (snake === undefined) {
                throw new Error(`SnakeChunk for unknown snake ${dto.snakeId}.`);
            }
            return new SnakeChunk(snake, dto);
        });
        this.foodChunks = new ManagedMap((dto) => new FoodChunk(dto));

        this.events.snakeDeath.addListener(({ deadSnakeId, killer }) => {
            if (deadSnakeId === this.#targetSnakeId) {
                this.#targetSnakeId = undefined;
                return;
            }

            if (killer && killer.snakeId === this.#targetSnakeId) {
                // TODO: avoid client-side counting
                this.#targetSnakeKills++;
            }
        });
    }

    static async joinAsPlayer(): Promise<[Game, Player]> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        const remote = game.#remote;

        // -- this is only temporary for testing
        const params = new URLSearchParams(document.location.search);
        const cfg = params.has("useSSL")
            ? { server: { ...clientConfig.server, wss: true } }
            : clientConfig;
        // -- TODO: remove this block

        const info = await remote.init(cfg).catch(async (e) => {
            await dialog({ title: "Error", content: `Failed to connect to the game server.` });
            return Promise.reject(e);
        });
        game.#config = info.config;
        game.camera.moveTo(Vector.fromObject(info.startPosition));
        game.#targetSnakeId = info.targetSnakeId;
        game.heatMap = new Uint8Array(info.config.chunks.rows * info.config.chunks.columns);

        remote.addEventListener(
            "serverUpdate",
            Comlink.proxy(() => {
                game.#updateAvailable = true;
            })
        );

        remote.addEventListener(
            "disconnect",
            Comlink.proxy(() => {
                game.#stopped = true;
                game.events.gameEnd.trigger({ reason: "disconnect" });
            })
        );

        remote.onSpectatorChange(
            Comlink.proxy((info) => {
                // TODO fix types
                const changeInfo = info as SpectatorChangeDTO;

                if (changeInfo.followSnake) {
                    game.#targetSnakeId = changeInfo.targetSnakeId;
                } else {
                    game.#targetSnakeId = undefined;
                    game.camera.moveTo(Vector.fromObject(changeInfo.position));
                }
            })
        );

        const player = new Player(remote, info.targetSnakeId, game);

        return [game, player];
    }

    static joinAsSpectator(): Promise<Game> {
        throw new Error("not implemented");
    }

    /**
     * Get and apply the latest game updates from the worker thread.
     */
    async update(): Promise<void> {
        if (!this.#updateAvailable) {
            return;
        }

        const changes = await this.#remote.getDataChanges();
        this.#updateAvailable = changes.moreUpdates;
        // TODO: handle congestion (?)
        const ticks = changes.ticksSinceLastUpdate;

        // update leaderboard
        if (changes.leaderboard) {
            this.statistics = changes.leaderboard;
        }

        // update heat map
        if (changes.heatMap) {
            this.heatMap = changes.heatMap;
        }

        this.foodChunks.addMultiple(changes.foodChunks);

        this.snakes.addMultiple(changes.snakes, ticks);

        // update snake chunks AFTER snakes
        this.snakeChunks.addMultiple(changes.snakeChunks);

        // remove dead snakes
        for (const { deadSnakeId, killer } of changes.snakeDeaths) {
            const snake = this.snakes.get(deadSnakeId);

            this.events.snakeDeath.trigger({ deadSnakeId, killer, snake });

            if (!snake) {
                continue;
            }

            // To avoid concurrent modification errors we have to copy the array here.
            const snakeChunks = Array.from(snake.getSnakeChunksIterator());
            for (const snakeChunk of snakeChunks) {
                this.snakeChunks.remove(snakeChunk.id);
            }

            this.snakes.remove(deadSnakeId);
        }

        const updatedSnakeIds = new Set<SnakeId>(changes.snakes.map((snake) => snake.id));
        if (updatedSnakeIds.size > 0) {
            // pause snakes that did not receive any updates
            this.snakes.forEach((snake) => {
                if (!updatedSnakeIds.has(snake.id)) {
                    snake.pause();
                }
            });
        }

        if (changes.moreUpdates) {
            await this.update();
        } else {
            this.#removeJunk();
        }
    }

    predict(): void {
        if (this.#stopped) {
            return;
        }
        for (const snake of this.snakes.values()) {
            snake.predict();
        }
        if (this.targetSnake) {
            this.camera.moveToSnake(this.targetSnake);
        }
    }

    quit(): void {
        this.#remote.quit();
        this.#stopped = true;
    }

    get config(): GameConfig {
        return this.#config;
    }

    get targetSnake(): Snake | undefined {
        if (this.#targetSnakeId === undefined) {
            return undefined;
        }

        return this.snakes.get(this.#targetSnakeId);
    }

    get targetSnakeKills(): number {
        return this.#targetSnakeKills;
    }

    #removeJunk() {
        const camera = this.camera;
        const safeDist = 2 * this.#config.snakes.fastSpeed;

        this.snakeChunks.removeIf(
            (chunk) =>
                chunk.junk || (!chunk.couldBeVisible(camera, safeDist) && chunk.clientAge > 1.0)
        );

        this.foodChunks.removeIf((chunk) => !chunk.isVisible(camera, safeDist) && chunk.age > 1.0);

        this.snakes.removeIf(
            (snake) =>
                snake.id !== this.#targetSnakeId &&
                !snake.hasChunks() &&
                !snake.couldBeVisible(camera, safeDist)
        );
    }
}

type SnakeId = number;
type SnakeChunkId = number;
type FoodChunkId = number;
type GameEndReason = { reason: "disconnect" };
