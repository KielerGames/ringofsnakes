import { GameConfig } from "../../data/config/GameConfig";
export type ClientToServerJSONMessage = never;
export type ServerToClientJSONMessage = SpawnInfo | SnakeDeathInfo | LeaderboardData;

export type SpawnInfo = Readonly<{
    tag: "SpawnInfo";
    snakeId: number;
    snakeName: string;
    snakePosition: { x: number; y: number };
    gameConfig: GameConfig;
}>;

export type SnakeDeathInfo = Readonly<{
    tag: "SnakeDeathInfo";
    snakeId: number;
}>;

export type LeaderboardData = Readonly<{
    tag: "Leaderboard";
    list: LeaderboardSnake[];
}>;

export type LeaderboardSnake = Readonly<{
    name: string;
    id: number;
    score: number;
}>;
