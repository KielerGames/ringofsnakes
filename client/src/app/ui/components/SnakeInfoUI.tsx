import { Component } from "preact";
import Snake from "../../data/snake/Snake";

type Props = {
    snake?: Readonly<Snake>;
};

export default class SnakeInfoUI extends Component<Props> {
    render() {
        const snake = this.props.snake;

        if (!snake) {
            return null;
        }

        return (
            <div id="snake-info">
                <div id="snake-name">{snake.name}</div>
                <div id="snake-length">
                    <span class="label">Length:</span>
                    <span class="value">{Math.round(snake.length)}</span>
                </div>
            </div>
        );
    }
}
