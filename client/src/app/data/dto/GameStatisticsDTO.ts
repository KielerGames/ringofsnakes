export type GameStatisticsDTO = {
    leaderboard: LeaderboardEntry[];
    numPlayers: number;
    numBots: number;
};

export type LeaderboardEntry = {
    id: number;
    name: string;
    length: number;
    kills: number;
};
