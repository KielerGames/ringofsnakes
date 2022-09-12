import * as Comlink from "comlink";
import { UserInputListener } from "../input/UserInput";
import { WorkerAPI } from "../worker/worker";
import Game from "./Game";
import * as UserInput from "../input/UserInput";

type Remote = Comlink.Remote<WorkerAPI>;

export default class Player {
    readonly snakeId: number;
    #remote: Remote;
    #game: Game;
    #alive: boolean = true;
    #inputListener: UserInputListener;

    constructor(remote: Remote, snakeId: number, game: Game) {
        this.snakeId = snakeId;
        this.#remote = remote;
        this.#game = game;

        this.#inputListener = (wantsFast, direction) => {
            if (this.alive) {
                this.#remote.sendUserInput(direction, wantsFast, this.#game.camera.viewBox);
            }
        };

        UserInput.addListener(this.#inputListener);

        game.events.snakeDeath.addListener(({ deadSnakeId }) => {
            if (deadSnakeId !== this.snakeId) {
                return;
            }

            this.#alive = false;
            UserInput.removeListener(this.#inputListener);
        });
    }

    get alive(): boolean {
        return this.#alive;
    }
}
