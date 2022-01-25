import * as Comlink from "comlink";
import { WorkerAPI } from "../worker/worker";
import * as ClientConfig from "./config/ClientConfig";
import { GameConfig } from "./config/GameConfig";
import Camera from "./camera/Camera";
import Snake from "./snake/Snake";
import SnakeChunk from "./snake/SnakeChunk";
import { LeaderboardDTO } from "./dto/Leaderboard";
import assert from "../util/assert";
import Vector from "../math/Vector";
import Player from "./Player";
import FoodChunk from "./world/FoodChunk";

export default class Game {
    camera: Camera = new Camera();
    readonly snakes: Map<SnakeId, Snake> = new Map();
    readonly snakeChunks: Map<SnakeChunkId, SnakeChunk> = new Map();
    readonly foodChunks: Map<FoodChunkId, FoodChunk> = new Map();
    leaderboard: LeaderboardDTO = { list: [] };

    private remote: Comlink.Remote<WorkerAPI>;
    private config: GameConfig;
    private updateAvailable: boolean = false;
    private targetSnakeId: number | undefined;
    private stopped: boolean = false;

    private constructor() {
        this.remote = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );
    }

    static async joinAsPlayer(name: string): Promise<[Game, Player]> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        const remote = game.remote;

        const info = await remote.init(name, clientConfig);
        game.config = info.config;
        game.camera.moveTo(Vector.fromObject(info.startPosition));
        game.targetSnakeId = info.targetSnakeId;

        remote.addEventListener(
            "server-update",
            Comlink.proxy(() => {
                game.updateAvailable = true;
            })
        );

        const player = new Player(remote, info.targetSnakeId, game);

        return [game, player];
    }

    static async joinAsSpectator(): Promise<Game> {
        throw new Error("not implemented");
    }

    async update(): Promise<void> {
        if (!this.updateAvailable) {
            return;
        }

        const changes = await this.remote.getDataChanges();
        this.updateAvailable = false;
        const ticks = changes.ticksSinceLastUpdate;

        // update leaderboard
        if (changes.leaderboard) {
            this.leaderboard = changes.leaderboard;
        }

        // update snakes
        for (const dto of changes.snakes) {
            if (this.snakes.has(dto.id)) {
                this.snakes.get(dto.id)!.update(dto, ticks);
            } else {
                this.snakes.set(dto.id, new Snake(dto, this.config));
            }
        }

        // update snake chunks
        for (const dto of changes.snakeChunks) {
            if (this.snakeChunks.has(dto.id)) {
                this.snakeChunks.get(dto.id)!.update(dto);
            } else {
                const snake = this.snakes.get(dto.snakeId)!;
                assert(snake !== undefined, "Data for unknown snake.");
                this.snakeChunks.set(dto.id, new SnakeChunk(snake, dto));
            }
        }

        // remove dead snakes
        for (const snakeId of changes.snakeDeaths) {
            const snake = this.snakes.get(snakeId);

            if (!snake) {
                continue;
            }

            for (const snakeChunk of snake.getSnakeChunksIterator()) {
                this.snakeChunks.delete(snakeChunk.id);
            }

            this.snakes.delete(snakeId);

            if (snakeId === this.targetSnakeId) {
                this.targetSnakeId = undefined;
                // TODO
                this.stopped = true;
            }
        }

        // update food chunks
        for (const dto of changes.foodChunks) {
            this.foodChunks.set(dto.id, new FoodChunk(dto));
        }
    }

    predict(): void {
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

    get targetSnake(): Snake | undefined {
        if (this.targetSnakeId === undefined) {
            return undefined;
        }

        return this.snakes.get(this.targetSnakeId);
    }
}

type SnakeId = number;
type SnakeChunkId = number;
type FoodChunkId = number;
