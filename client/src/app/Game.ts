import * as Comlink from "comlink";
import { SnakeCamera } from "./data/Camera";
import GameData from "./data/GameData";
import { WorkerAPI } from "./worker/worker";

export default class Game {
    private worker: Comlink.Remote<WorkerAPI>;
    private _data: GameData;
    private updateInterval: number = -1;
    private _ended: boolean = false;
    public camera: SnakeCamera = new SnakeCamera();

    private constructor() {
        this.worker = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );
    }

    public static async joinAs(name: string): Promise<Game> {
        const game = new Game();
        await game.worker.init(name);
        const config = await game.worker.getConfig();
        game._data = new GameData(config);

        game.updateInterval = window.setInterval(
            game.getUpdatesFromWorker.bind(game),
            1000 * config.tickDuration
        );
        game.worker.onEnd(Comlink.proxy(() => game.stop()));

        return game;
    }

    public get data(): Readonly<GameData> {
        return this._data;
    }

    private async getUpdatesFromWorker(): Promise<void> {
        try {
            const diff = await this.worker.getGameDataUpdate();
            this._data.update(diff);
            this.camera.setTargetSnake(this._data.getTargetSnake);
        } catch (e) {
            console.error(e);
            this.stop();
        }
    }

    public async frameTick(time: number): Promise<void> {
        const t = this._data.timeSinceLastUpdate(time);
        this.camera.update(t);
        this._data.predict(t);
    }

    public async updateUserInput(alpha: number, fast: boolean): Promise<void> {
        this.worker.updateUserInput(alpha, fast);
    }

    public get ended(): boolean {
        return this._ended;
    }

    public stop(): void {
        this._ended = true;
        window.clearInterval(this.updateInterval);
    }
}
