import { Component } from "preact";
import Snake from "../../../data/snake/Snake";
import { Supplier } from "../../../util/FunctionTypes";

type SLProps = {
    supplier: Supplier<Iterable<Readonly<Snake>>>;
};

export default class SnakeList extends Component<SLProps> {
    render() {
        const snakes = Array.from(this.props.supplier());

        return (
            <div id="snake-list" class="debug-ui">
                {snakes.length > 0
                    ? snakes
                          .filter((snake) => snake.hasChunks())
                          .slice(0, 7)
                          .map((snake) => (
                              <SnakeOverview key={snake.id} snake={snake} />
                          ))
                    : "No snake data."}
            </div>
        );
    }
}

type SOProps = {
    snake: Readonly<Snake>;
};

function SnakeOverview(props: SOProps) {
    const snake = props.snake;

    const classes = ["snake"];
    if (snake.target) {
        classes.push("target");
    }
    if (snake.fast) {
        classes.push("fast");
    }

    return (
        <div class={classes.join(" ")}>
            {snake.toString()}
        </div>
    );
}
