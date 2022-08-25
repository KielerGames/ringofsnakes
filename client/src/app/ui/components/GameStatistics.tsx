import { Component } from "preact";
import { GameStatisticsDTO, LeaderboardEntry } from "../../data/dto/GameStatisticsDTO";

type LeaderboardProps = {
    data: Readonly<GameStatisticsDTO>;
    targetId?: number;
};

export default class GameStatistics extends Component<LeaderboardProps> {
    render() {
        const gameStats = this.props.data;
        if (!gameStats || gameStats.leaderboard.length === 0) {
            return null;
        }

        const targetId = this.props.targetId;
        const multiple = gameStats.leaderboard.length > 1;

        return (
            <div id="game-stats">
                <div id="leaderboard" class={multiple ? "multiple" : ""}>
                    {gameStats.leaderboard.map((entry, index) => (
                        <LeaderboardEntry
                            key={entry.name}
                            data={entry}
                            index={index}
                            isTarget={entry.id === targetId}
                        />
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
    isTarget: boolean;
};

function LeaderboardEntry(props: Readonly<Props>) {
    const entry = props.data;
    const index = props.index;
    const cssClass = props.isTarget ? "target" : "";

    return (
        <>
            <span class={cssClass}>{index + 1}.</span>
            <span class={cssClass}>{entry.name}</span>
            <span class={cssClass} title="length">
                {entry.length}
            </span>
            <span class={cssClass} title="kills">
                {entry.kills === 0 ? "-" : entry.kills + "K"}
            </span>
        </>
    );
}
