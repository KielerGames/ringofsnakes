import { Component } from "preact";
import { GameStatisticsDTO, LeaderboardEntry } from "../../data/dto/GameStatisticsDTO";

type LeaderboardProps = {
    data: Readonly<GameStatisticsDTO>;
};

export default class Leaderboard extends Component<LeaderboardProps> {
    render() {
        const leaderboardData = this.props.data;
        if (!leaderboardData) {
            return null;
        }

        return (
            <div id="leaderboard">
                {leaderboardData.list.map((entry, index) => (
                    <LeaderboardView key={entry.name} data={entry} index={index} />
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
