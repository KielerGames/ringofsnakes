import { GameConfig } from "./types/GameConfig";
export type ClientToServerMessage = UpdatePlayerName;
export type ServerToClientJSONMessage = SpawnInfo | SnakeDeathInfo | TopNList;

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

export type TopNList = Readonly<{
    tag: "TopNList";
    list: TopNListEntry[];
}>;

export type TopNListEntry = Readonly<{
    name: string;
    score: number;
}>;
