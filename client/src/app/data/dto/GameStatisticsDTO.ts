export type GameStatisticsDTO = {
    leaderboard: LeaderboardEntry[];
    numPlayers: number;
    numBots: number;
};

export type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
};
