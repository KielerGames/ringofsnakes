import { Component } from "preact";
import Snake from "../../data/snake/Snake";

type Props = {
    snake?: Readonly<Snake>;
    kills?: number;
};

export default class SnakeInfoUI extends Component<Props> {
    render() {
        const snake = this.props.snake;

        if (!snake) {
            return null;
        }

        const kills = this.props.kills ?? 0;

        return (
            <div id="snake-info">
                <div id="snake-name">{snake.name}</div>
                <div id="snake-data">
                    <span class="label">Length:</span>
                    <span class="value">{Math.round(snake.length)}</span>
                    {kills > 0 ? (
                        <>
                            <span class="label">Kills:</span>
                            <span class="value">{kills}</span>
                        </>
                    ) : null}
                </div>
            </div>
        );
    }
}
