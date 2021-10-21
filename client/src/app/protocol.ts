import { GameConfig } from "./types/GameConfig";
export type ClientToServerMessage = UpdatePlayerName;
export type ServerToClientJSONMessage =
    | SpawnInfo
    | SnakeDeathInfo
    | LeaderboardData;

export type UpdatePlayerName = {
    tag: "UpdatePlayerName";
    name: string;
};

export type SpawnInfo = Readonly<{
    tag: "SpawnInfo";
    snakeId: number;
    gameConfig: GameConfig;
}>;

export type SnakeDeathInfo = Readonly<{
    tag: "SnakeDeathInfo";
    snakeId: number;
}>;

export type LeaderboardData = Readonly<{
    tag: "Leaderboard";
    list: LeaderboardEntry[];
}>;

export type LeaderboardEntry = Readonly<{
    name: string;
    score: number;
}>;
