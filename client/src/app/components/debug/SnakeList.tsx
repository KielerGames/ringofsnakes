import { Component } from "preact";
import GameData from "../../data/GameData";
import Snake from "../../data/Snake";
import SnakeChunk from "../../data/SnakeChunk";

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
                    ? snakes.map((snake) => (
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
            <div class="snake-info">{`Snake ${snake.id}`}</div>
            <div class="chunks">
                {snake.getSnakeChunks().map((chunk) => (
                    <div class="chunk-info" key={chunk.id}>
                        {`id:${getIdStringOfSnakeChunk(chunk)} len:${Math.round(
                            chunk.length
                        )}`}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getIdStringOfSnakeChunk(chunk: Readonly<SnakeChunk>): string {
    const CHUNK_ID_MASK = (1 << 16) - 1;
    return `${chunk.id & CHUNK_ID_MASK}${chunk.final ? "" : "*"}`;
}
