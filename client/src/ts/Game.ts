import * as Comlink from "comlink";
import GameData from "./data/GameData";
import { WorkerAPI } from "./worker/worker";

export default class Game {
    private worker: Comlink.Remote<WorkerAPI>;
    public data: GameData;

    public constructor(name: string) {
        this.worker = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );

        this.data = new GameData();

        this.worker.init(name);
    }

    public async update(): Promise<void> {
        const frameData = await this.worker.requestFrameData(42.0);
        this.data.update(frameData);
    }

    public async updateUserInput(alpha: number, fast: boolean): Promise<void> {
        this.worker.updateUserInput(alpha, fast);
    }
}
