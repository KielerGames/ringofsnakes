import * as Comlink from "comlink";
import { WorkerAPI } from "./worker/worker";
import * as ClientConfig from "./data/config/ClientConfig";
import { GameConfig } from "./data/config/GameConfig";
import Camera from "./data/camera/Camera";

export default class Game {
    camera: Camera = new Camera();
    
    #remote: Comlink.Remote<WorkerAPI>;
    #config: GameConfig;
    #updateAvailable: boolean = false;

    private constructor() {
        this.#remote = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );
    }

    static async joinAs(name: string): Promise<Game> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        const remote = game.#remote;

        game.#config = await remote.init(name, clientConfig);

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
    }
}
