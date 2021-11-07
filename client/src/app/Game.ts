import * as Comlink from "comlink";
import { Camera, SnakeCamera, TargetCamera } from "./data/Camera";
import * as ClientConfig from "./data/ClientConfig";
import GameData from "./data/GameData";
import Snake from "./data/Snake";
import { WorkerAPI } from "./worker/worker";

export default class Game {
    private worker: Comlink.Remote<WorkerAPI>;
    private _data: GameData;
    private updateInterval: number = -1;
    private _ended: boolean = false;
    public camera: Camera = new TargetCamera(0, 0);

    private constructor() {
        this.worker = Comlink.wrap<WorkerAPI>(
            new Worker("worker.bundle.js", { name: "SnakeWorker" })
        );
    }

    public static async joinAs(name: string): Promise<Game> {
        const clientConfig = await ClientConfig.get();
        const game = new Game();
        await game.worker.init(name, clientConfig);
        const config = await game.worker.getConfig();
        game._data = new GameData(config);

        game.updateInterval = window.setInterval(
            game.getUpdatesFromWorker.bind(game),
            Math.max(32, 1000 * config.tickDuration)
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
            this.updateCamera();
        } catch (e) {
            console.error(e);
            this.stop();
        }
    }

    private updateCamera(): void {
        let targetSnake: Snake | undefined;

        // TODO: fix this mess
        try {
            targetSnake = this._data.targetSnake;
        } catch(e) {
            targetSnake = undefined;
        }
        
        if (targetSnake) {
            try {
                if (this.camera instanceof SnakeCamera) {
                    this.camera.setTargetSnake(targetSnake);
                } else {
                    this.camera = new SnakeCamera(targetSnake);
                }
            } catch(e) {
                this.camera = new TargetCamera(0, 0);
            }
            
        } else {
            // TODO
            this.camera = new TargetCamera(0, 0);
        }
    }

    public async frameTick(time: number): Promise<void> {
        const t = this._data.timeSinceLastUpdate(time);
        this.camera.update(t);
        this._data.predict(t);
    }

    public async updateUserData(
        alpha: number,
        wantsFast: boolean
    ): Promise<void> {
        this.worker.updateUserData(alpha, wantsFast, this.camera.getViewBox());
    }

    public get ended(): boolean {
        return this._ended;
    }

    public stop(): void {
        this._ended = true;
        window.clearInterval(this.updateInterval);
    }
}
