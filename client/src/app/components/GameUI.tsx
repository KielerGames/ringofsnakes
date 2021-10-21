import { Component } from "preact";
import Game from "../Game";
import FPSStats from "./debug/FPSStats";
import SnakeList from "./debug/SnakeList";
import SnakeInfoUI from "./SnakeInfoUI";
import UserInput from "./UserInput";
import Highscore from "./Highscore"
import WorkerGame from "../worker/WorkerGame";

type Props = {
    game: Game;
    workerGame: WorkerGame
};

export default class GameUI extends Component<Props> {
    public render() {
        const game = this.props.game;
        const workerGame = this.props.workerGame;

        return (
            <>
                <FPSStats />
                <SnakeInfoUI game={game} />
                {__DEBUG__ ? <SnakeList data={game.data} /> : null}
                <UserInput
                    initial={0.0}
                    onChange={game.updateUserData.bind(game)}
                />
                <Highscore data={workerGame} />
            </>
        );
    }
}
