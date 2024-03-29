import { Component } from "preact";
import Game from "../data/Game";
import FPSStats from "./components/debug/FPSStats";
import GameStatistics from "./components/GameStatistics";
import SnakeInfoUI from "./components/SnakeInfoUI";

type Props = {
    game: Game;
};

export default class GameOverlay extends Component<Props> {
    #timer: number;

    componentDidMount() {
        this.#timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);
    }

    componentWillUnmount() {
        window.clearInterval(this.#timer);
    }

    render() {
        const game = this.props.game;

        return (
            <>
                <GameStatistics data={game.statistics} targetId={game.targetSnake?.id} />
                <FPSStats />
                <SnakeInfoUI snake={game.targetSnake} kills={game.targetSnakeKills} />
            </>
        );
    }
}
