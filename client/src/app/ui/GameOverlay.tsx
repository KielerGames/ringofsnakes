import { Component } from "preact";
import Game from "../data/Game";
import FPSStats from "./components/debug/FPSStats";
import SnakeList from "./components/debug/SnakeList";
import Leaderboard from "./components/Leaderboard";
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
        const snakeSupplier = () => game.snakes.values();

        return (
            <>
                <Leaderboard data={game.leaderboard} />
                <FPSStats />
                <SnakeInfoUI snake={game.targetSnake} />
                {__DEBUG__ ? <SnakeList supplier={snakeSupplier} /> : null}
            </>
        );
    }
}
