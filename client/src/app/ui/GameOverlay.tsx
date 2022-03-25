import { Component, createRef } from "preact";
import Game from "../data/Game";
import FPSStats from "./components/debug/FPSStats";
import Leaderboard from "./components/Leaderboard";
import SnakeInfoUI from "./components/SnakeInfoUI";
import * as HeatMapRenderer from "../renderer/modules/HeatMapRenderer";

type Props = {
    game: Game;
};

export default class GameOverlay extends Component<Props> {
    private timer: number;
    private canvasRef = createRef<HTMLCanvasElement>();

    componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);

        if (this.canvasRef.current) {
            HeatMapRenderer.setCanvas(this.canvasRef.current);
        }
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
                <canvas id="heatmap" ref={this.canvasRef} />
                <SnakeInfoUI snake={game.targetSnake} />
            </>
        );
    }
}
