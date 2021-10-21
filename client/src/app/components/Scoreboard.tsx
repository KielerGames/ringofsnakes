import { Component } from "preact";
import GameData from "../data/GameData";
import { TopNList, TopNListEntry } from "../protocol";

type ScoreboardProps = {
    data: Readonly<GameData>;
};

export default class Scoreboard extends Component<ScoreboardProps> {
    private timer: number;

    public componentDidMount() {
        this.timer = window.setInterval(() => {
            this.forceUpdate();
        }, 1000);
    }

    public componentWillUnmount() {
        window.clearInterval(this.timer);
    }

    public render() {
        const leaderboard = this.props.data.getTopNList();
        if (leaderboard === undefined) {
            return null;
        }

        return (
            <div id="leaderboard">
                {leaderboard.list.map((entry, index) => (
                    <ScoreboardEntry
                        key={entry.name}
                        data={entry}
                        index={index}
                    />
                ))}
            </div>
        );
    }
}

type Props = {
    data: TopNListEntry;
    index: number;
};

function ScoreboardEntry(props: Readonly<Props>) {
    const entry = props.data;
    const index = props.index;

    return (
        <div class="entry">
            {index + 1}. {entry.name}: {entry.score}
        </div>
    );
}
