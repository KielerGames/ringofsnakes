export type LeaderboardDTO = {
    list: LeaderboardEntry[];
};

export type LeaderboardEntry = {
    name: string;
    score: number;
}
