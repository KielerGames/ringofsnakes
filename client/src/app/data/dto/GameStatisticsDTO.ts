export type GameStatisticsDTO = {
    list: LeaderboardEntry[];
};

export type LeaderboardEntry = {
    name: string;
    score: number;
};
