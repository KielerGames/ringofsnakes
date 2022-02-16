import * as Comlink from "comlink";
import { UserInputListener } from "../input/UserInput";
import { WorkerAPI } from "../worker/worker";
import Game from "./Game";
import * as UserInput from "../input/UserInput";

type Remote = Comlink.Remote<WorkerAPI>;

export default class Player {
    private remote: Remote;
    private game: Game;
    readonly snakeId: number;
    private _alive: boolean = true;
    private inputListener: UserInputListener;

    constructor(remote: Remote, snakeId: number, game: Game) {
        this.remote = remote;
        this.snakeId = snakeId;
        this.game = game;

        this.inputListener = (wantsFast, direction) => {
            if (this.alive) {
                this.remote.sendUserInput(direction, wantsFast, this.game.camera.viewBox);
            }
        };

        UserInput.addListener(this.inputListener);

        game.addEventListener("snakeDeath", (snake) => {
            if (snake.id !== this.snakeId) {
                return;
            }

            this._alive = false;
            UserInput.removeListener(this.inputListener);
        });
    }

    get alive(): boolean {
        return this._alive;
    }
}
