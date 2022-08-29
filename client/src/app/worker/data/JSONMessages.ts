import { GameConfig } from "../../data/config/GameConfig";
import { GameStatisticsDTO } from "../../data/dto/GameStatisticsDTO";
export type ClientToServerJSONMessage = never;
export type ServerToClientJSONMessage =
    | GameInfo
    | SnakeDeathInfo
    | LeaderboardData
    | SnakeNameUpdate;

export type GameInfo = Readonly<{
    tag: "GameInfo";
    snakeId: number;
    snakeName?: string;
    startPosition: { x: number; y: number };
    gameConfig: GameConfig;
    clientType: "PLAYER" | "SPECTATOR" | "STATIONARY_SPECTATOR";
}>;

export type SnakeDeathInfo = Readonly<{
    tag: "SnakeDeathInfo";
    deadSnakeId: number;
    killerSnakeId?: number;
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
