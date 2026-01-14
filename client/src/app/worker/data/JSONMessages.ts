import { GameConfig } from "../../data/config/GameConfig";
import { GameStatisticsDTO } from "../../data/dto/GameStatisticsDTO";
import { SpectatorChangeDTO } from "../../data/dto/SpectatorChangeDTO";
export type ClientToServerJSONMessage = never;
export type ServerToClientJSONMessage =
    | GameInfo
    | SnakeDeathInfo
    | LeaderboardData
    | SnakeNameUpdate
    | SpectatorChange;

export type GameInfo = Readonly<{
    tag: "GameInfo";
    snakeId: number;
    snakeName?: string;
    startPosition: { x: number; y: number };
    gameConfig: GameConfig;
    recordingEnabled: boolean;
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

export type SpectatorChange = Readonly<
    {
        tag: "SpectatorChange";
    } & SpectatorChangeDTO
>;
