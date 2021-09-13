import * as Comlink from "comlink";
import { SnakeCamera } from "./data/Camera";
import GameData from "./data/GameData";
import { WorkerAPI } from "./worker/worker";

export default class Game {
    private worker: Comlink.Remote<WorkerAPI>;
    public data: GameData;
    private updateInterval: number = -1;
    private _ended: boolean = false;
    public camera: SnakeCamera = new SnakeCamera();

    private constructor() {
        this.worker = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );

        this.data = new GameData();
    }

    public static async joinAs(name: string): Promise<Game> {
        const game = new Game();
        await game.worker.init(name);

        const config = await game.worker.getConfig();
        game.updateInterval = window.setInterval(
            game.updateData.bind(game),
            1000 * config.tickDuration
        );
        game.worker.onEnd(Comlink.proxy(() => game.stop()));

        return game;
    }

    private async updateData(): Promise<void> {
        try {
            const diff = await this.worker.getGameDataUpdate();
            this.data.update(diff);
            this.camera.setTargetSnake(this.data.getTargetSnake);
        } catch (e) {
            console.error(e);
            this.stop();
        }
    }

    public async frameTick(time: number): Promise<void> {
        const t = this.data.timeSinceLastUpdate(time);
        this.camera.update(t);
        this.data.predict(t);
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
