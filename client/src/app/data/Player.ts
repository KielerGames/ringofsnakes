import * as Comlink from "comlink";
import { WorkerAPI } from "../worker/worker";
import Game from "./Game";

type Remote = Comlink.Remote<WorkerAPI>;

export default class Player {
    private remote: Remote;
    private game: Game;
    readonly snakeId: number;
    private snakeHasExisted: boolean = false;

    constructor(remote: Remote, snakeId: number, game: Game) {
        this.remote = remote;
        this.snakeId = snakeId;
        this.game = game;
    }

    sendUserInput(): void {
        this.remote.sendUserInput(0, false, this.game.camera.viewBox);
    }

    get alive(): boolean {
        const snake = this.game.targetSnake;

        if (snake === undefined && !this.snakeHasExisted) {
            return true;
        }

        if (snake !== undefined) {
            this.snakeHasExisted = true;
        }

        return snake !== undefined && snake.id === this.snakeId;
    }
}
