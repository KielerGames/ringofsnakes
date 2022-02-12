import { Component } from "preact";
import Game from "../data/Game";
import FPSStats from "./components/debug/FPSStats";
import Leaderboard from "./components/Leaderboard";
import SnakeInfoUI from "./components/SnakeInfoUI";

type Props = {
    game: Game;
};

export default class GameOverlay extends Component<Props> {
    private timer: number;

    componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);
    }

    componentWillUnmount() {
        window.clearInterval(this.timer);
    }

    render() {
        const game = this.props.game;

        return (
            <>
                <Leaderboard data={game.leaderboard} />
                <FPSStats />
                <SnakeInfoUI snake={game.targetSnake} />
            </>
        );
    }
}
