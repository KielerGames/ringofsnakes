import { GameConfig } from "../../data/config/GameConfig";
import { GameStatisticsDTO } from "../../data/dto/GameStatisticsDTO";
export type ClientToServerJSONMessage = never;
export type ServerToClientJSONMessage =
    | SpawnInfo
    | SnakeDeathInfo
    | LeaderboardData
    | SnakeNameUpdate;

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

export type LeaderboardData = Readonly<
    {
        tag: "GameStatistics";
    } & GameStatisticsDTO
>;

export type LeaderboardSnake = Readonly<{
    name: string;
    id: number;
    score: number;
}>;

export type SnakeNameUpdate = Readonly<{
    tag: "SnakeNameUpdate";
    names: Record<string, string>;
}>;
