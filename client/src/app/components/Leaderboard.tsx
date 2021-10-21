import { Component } from "preact";
import GameData from "../data/GameData";
import { LeaderboardData, LeaderboardEntry } from "../protocol";

type LeaderboardProps = {
    data: Readonly<GameData>;
};

export default class Leaderboard extends Component<LeaderboardProps> {
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
        const leaderboardData = this.props.data.getLeaderboardData();
        if (leaderboardData === undefined) {
            return null;
        }

        return (
            <div id="leaderboard">
                {leaderboardData.list.map((entry, index) => (
                    <LeaderboardView
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
    data: LeaderboardEntry;
    index: number;
};

function LeaderboardView(props: Readonly<Props>) {
    const entry = props.data;
    const index = props.index;

    return (
        <div class="entry">
            {index + 1}. {entry.name}: {entry.score}
        </div>
    );
}
