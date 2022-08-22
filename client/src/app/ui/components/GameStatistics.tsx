import { Component } from "preact";
import { GameStatisticsDTO, LeaderboardEntry } from "../../data/dto/GameStatisticsDTO";

type LeaderboardProps = {
    data: Readonly<GameStatisticsDTO>;
};

export default class GameStatistics extends Component<LeaderboardProps> {
    render() {
        const gameStats = this.props.data;
        if (!gameStats || gameStats.leaderboard.length === 0) {
            return null;
        }

        return (
            <div id="game-stats">
                <div id="leaderboard">
                    {gameStats.leaderboard.map((entry, index) => (
                        <LeaderboardEntry key={entry.name} data={entry} index={index} />
                    ))}
                </div>
                <div id="player-numbers">
                    <div>Players</div>
                    <div>{gameStats.numPlayers}</div>
                    <div>Bots</div>
                    <div>{gameStats.numBots}</div>
                </div>
            </div>
        );
    }
}

type Props = {
    data: LeaderboardEntry;
    index: number;
};

function LeaderboardEntry(props: Readonly<Props>) {
    const entry = props.data;
    const index = props.index;

    return (
        <div class="entry">
            <span>{index + 1}.</span>
            <span>{entry.name}</span>
            <span title="length">{entry.length}</span>
            <span title="kills">{entry.kills === 0 ? "-" : entry.kills + "K"}</span>
        </div>
    );
}
