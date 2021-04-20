import * as Comlink from "comlink";
import GameData from "./data/GameData";
import { WorkerAPI } from "./worker/worker";

export default class Game {
    private worker: Comlink.Remote<WorkerAPI>;
    public data: GameData;
    private updateInterval: number = -1;
    private _ended: boolean = false;

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
            config.tickDuration
        );
        game.worker.onEnd(Comlink.proxy(() => (game._ended = true)));

        return game;
    }

    private async updateData(): Promise<void> {
        const tickData = await this.worker.getNextTickData();
        this.data.update(tickData);
    }

    private async update(): Promise<void> {
        //TODO
    }

    public async updateUserInput(alpha: number, fast: boolean): Promise<void> {
        this.worker.updateUserInput(alpha, fast);
    }

    public get ended(): boolean {
        return this._ended;
    }
}
