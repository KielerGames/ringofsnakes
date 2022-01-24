import * as Comlink from "comlink";
import { WorkerAPI } from "./worker/worker";
import * as ClientConfig from "./data/config/ClientConfig";
import { GameConfig } from "./data/config/GameConfig";
import Camera from "./data/camera/Camera";
import Snake from "./data/snake/Snake";
import SnakeChunk from "./data/snake/SnakeChunk";
import { LeaderboardDTO } from "./data/dto/Leaderboard";
import assert from "./util/assert";
import Vector from "./math/Vector";

export default class Game {
    camera: Camera = new Camera();
    snakes: Map<SnakeId, Snake> = new Map();
    snakeChunks: Map<SnakeChunkId, SnakeChunk> = new Map();
    leaderboard: LeaderboardDTO = { list: [] };

    #remote: Comlink.Remote<WorkerAPI>;
    #config: GameConfig;
    #updateAvailable: boolean = false;
    #targetSnakeId: number | undefined;
    #stopped: boolean = false;

    private constructor() {
        this.#remote = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );
    }

    static async joinAs(name: string): Promise<Game> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        const remote = game.#remote;

        const info = await remote.init(name, clientConfig);
        game.#config = info.config;
        game.camera.moveTo(Vector.fromObject(info.startPosition));
        game.#targetSnakeId = info.targetSnakeId;

        remote.addEventListener(
            "server-update",
            Comlink.proxy(() => {
                game.#updateAvailable = true;
            })
        );

        return game;
    }

    async update(): Promise<void> {
        if (!this.#updateAvailable) {
            return;
        }

        const changes = await this.#remote.getDataChanges();
        this.#updateAvailable = false;
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
                this.snakes.set(dto.id, new Snake(dto, this.#config));
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

            if (snakeId === this.#targetSnakeId) {
                // TODO
                this.#stopped = true;
            }
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

    sendUserInput(): void {
        this.#remote.sendUserInput(0, false, this.camera.viewBox);
    }

    quit(): void {
        this.#remote.quit();
    }

    get targetSnake(): Snake | undefined {
        if (this.#targetSnakeId === undefined) {
            return undefined;
        }

        return this.snakes.get(this.#targetSnakeId);
    }

    get playerAlive(): boolean {
        return !this.#stopped;
    }
}

type SnakeId = number;
type SnakeChunkId = number;
