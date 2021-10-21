import { Component } from "preact";
import Game from "../Game";

type Props = {
    game: Readonly<Game>;
};

export default class SnakeInfoUI extends Component<Props> {
    private timer: number;

    public render() {
        const snake = this.props.game.data.targetSnake;

        if (!snake) {
            return null;
        }

        return (
            <div id="snake-info">
                <div id="snake-name">A snake name</div>
                <div id="snake-length">
                    Length:{" "}
                    <span class="value">{Math.round(snake.length)}</span>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 333);
    }

    public componentWillUnmount() {
        window.clearInterval(this.timer);
    }
}
