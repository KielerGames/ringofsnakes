import { Component } from "preact";
import GameData from "../../data/GameData";
import Snake from "../../data/Snake";

type SLProps = {
    data: Readonly<GameData>;
};

export default class SnakeList extends Component<SLProps> {
    private timer: number;

    public constructor(props: SLProps) {
        super(props);
    }

    public componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 500);
    }

    public componentWillUnmount() {
        window.clearInterval(this.timer);
    }

    public render() {
        const snakes = Array.from(this.props.data.getSnakes());

        return (
            <div id="snake-list" class="debug-ui">
                {snakes.length > 0
                    ? snakes
                          .filter((snake) => snake.hasChunks())
                          .slice(0, 7)
                          .map((snake) => (
                              <SnakeOverview key={snake.id} data={snake} />
                          ))
                    : "No snake data."}
            </div>
        );
    }
}

type SOProps = {
    data: Snake;
};

function SnakeOverview(props: Readonly<SOProps>) {
    const snake = props.data;

    return (
        <div class={`snake skin${snake.skin}`}>
            <div class="snake-info">{`Snake ${snake.id} with ${snake.getSnakeChunks().length} chunks`}</div>
        </div>
    );
}
