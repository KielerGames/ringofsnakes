import { Component } from "preact";
import Snake from "../../../data/snake/Snake";
import { Supplier } from "../../../util/FunctionTypes";

type SLProps = {
    supplier: Supplier<Iterable<Readonly<Snake>>>;
};

export default class SnakeList extends Component<SLProps> {
    #timer: number;

    constructor(props: SLProps) {
        super(props);
    }

    componentDidMount() {
        this.#timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);
    }

    componentWillUnmount() {
        window.clearInterval(this.#timer);
    }

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

    // <div class="snake-info">{`Snake ${snake.id} with ${snake.getSnakeChunks().length} chunks`}</div>

    return (
        <div class={`snake skin${snake.skin}`}>
            <div class="snake-info">{`Snake ${snake.id}`}</div>
        </div>
    );
}
