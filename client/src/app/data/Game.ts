import * as Comlink from "comlink";
import { WorkerAPI } from "../worker/worker";
import * as ClientConfig from "./config/ClientConfig";
import { GameConfig } from "./config/GameConfig";
import Camera from "./camera/Camera";
import Snake from "./snake/Snake";
import SnakeChunk from "./snake/SnakeChunk";
import { LeaderboardDTO } from "./dto/Leaderboard";
import Vector from "../math/Vector";
import Player from "./Player";
import FoodChunk from "./world/FoodChunk";
import createRemote from "../worker/WorkerFactory";
import { ManagedMap } from "../util/ManagedMap";
import { SnakeDTO } from "./dto/SnakeDTO";
import { SnakeChunkDTO } from "./dto/SnakeChunkDTO";
import { FoodChunkDTO } from "./dto/FoodChunkDTO";
import { AppEvent } from "../util/AppEvent";
import { Consumer } from "../util/FunctionTypes";
import { dialog } from "../ui/Dialogs";

export default class Game {
    camera: Camera = new Camera();
    readonly snakes: ManagedMap<SnakeDTO, SnakeId, Snake, number>;
    readonly snakeChunks: ManagedMap<SnakeChunkDTO, SnakeChunkId, SnakeChunk>;
    readonly foodChunks: ManagedMap<FoodChunkDTO, FoodChunkId, FoodChunk>;
    leaderboard: LeaderboardDTO = { list: [] };
    heatMap: Uint8Array;

    private remote: Comlink.Remote<WorkerAPI>;
    private _config: GameConfig;
    private updateAvailable: boolean = false;
    private targetSnakeId: number | undefined;
    private stopped: boolean = false;

    private readonly events = {
        snakeDeath: new AppEvent<Snake>()
    };

    private constructor() {
        this.remote = createRemote();
        this.snakes = new ManagedMap((dto) => new Snake(dto, this._config));
        this.snakeChunks = new ManagedMap((dto) => {
            const snake = this.snakes.get(dto.snakeId);
            if (snake === undefined) {
                throw new Error(`SnakeChunk for unknown snake ${dto.snakeId}.`);
            }
            return new SnakeChunk(snake, dto);
        });
        this.foodChunks = new ManagedMap((dto) => new FoodChunk(dto));
    }

    static async joinAsPlayer(): Promise<[Game, Player]> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        const remote = game.remote;

        const info = await remote.init(clientConfig).catch(async (e) => {
            await dialog({ title: "Error", content: `Failed to connect to the game server.` });
            return Promise.reject(e);
        });
        game._config = info.config;
        game.camera.moveTo(Vector.fromObject(info.startPosition));
        game.targetSnakeId = info.targetSnakeId;
        game.heatMap = new Uint8Array(info.config.chunks.rows * info.config.chunks.columns);

        remote.addEventListener(
            "server-update",
            Comlink.proxy(() => {
                game.updateAvailable = true;
            })
        );

        remote.addEventListener(
            "disconnect",
            Comlink.proxy(() => {
                game.stopped = true;
                dialog({
                    title: "Disconnected",
                    content: `You have been disconnected from the server.`
                });
            })
        );

        const player = new Player(remote, info.targetSnakeId, game);

        return [game, player];
    }

    // eslint-disable-next-line require-await
    static async joinAsSpectator(): Promise<Game> {
        throw new Error("not implemented");
    }

    /**
     *
     */
    async update(): Promise<void> {
        if (!this.updateAvailable) {
            return;
        }

        const changes = await this.remote.getDataChanges();
        this.updateAvailable = changes.moreUpdates;
        // TODO: handle congestion (?)
        const ticks = changes.ticksSinceLastUpdate;

        // update leaderboard
        if (changes.leaderboard) {
            this.leaderboard = changes.leaderboard;
        }

        // update heat map
        if (changes.heatMap) {
            this.heatMap = changes.heatMap;
        }

        this.foodChunks.addMultiple(changes.foodChunks);

        this.snakes.addMultiple(changes.snakes, ticks);
        if (this.targetSnakeId !== undefined) {
            this.snakes.runIfPresent(this.targetSnakeId, (snake) => (snake.target = true));
        }

        // update snake chunks AFTER snakes
        this.snakeChunks.addMultiple(changes.snakeChunks);

        // remove dead snakes
        for (const snakeId of changes.snakeDeaths) {
            const snake = this.snakes.get(snakeId);

            if (!snake) {
                continue;
            }

            this.events.snakeDeath.trigger(snake);

            for (const snakeChunk of snake.getSnakeChunksIterator()) {
                this.snakeChunks.remove(snakeChunk.id);
            }

            this.snakes.remove(snakeId);

            if (snakeId === this.targetSnakeId) {
                this.targetSnakeId = undefined;
            }
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

        this.removeJunk();
    }

    predict(): void {
        if (this.stopped) {
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
        this.remote.quit();
        this.stopped = true;
    }

    addEventListener(event: EventName, listener: Consumer<Snake>): void {
        this.events[event].addListener(listener);
    }

    get config(): GameConfig {
        return this._config;
    }

    get targetSnake(): Snake | undefined {
        if (this.targetSnakeId === undefined) {
            return undefined;
        }

        return this.snakes.get(this.targetSnakeId);
    }

    private removeJunk() {
        const camera = this.camera;
        const safeDist = 2 * this._config.snakes.fastSpeed;

        this.snakeChunks.removeIf(
            (chunk) => chunk.junk || (!chunk.isVisible(camera, safeDist) && chunk.clientAge > 1.0)
        );

        this.foodChunks.removeIf((chunk) => !chunk.isVisible(camera, safeDist) && chunk.age > 1.0);

        this.snakes.removeIf(
            (snake) =>
                snake.id !== this.targetSnakeId &&
                !snake.hasChunks() &&
                !snake.isVisible(camera, safeDist)
        );
    }
}

type SnakeId = number;
type SnakeChunkId = number;
type FoodChunkId = number;

type EventName = "snakeDeath";
