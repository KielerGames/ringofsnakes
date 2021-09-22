import { GameConfig } from "./types/GameConfig";

export type ClientToServerMessage = UpdatePlayerName;
export type ServerToClientJSONMessage = SpawnInfo;

export type UpdatePlayerName = {
    tag: "UpdatePlayerName";
    name: string;
};

export type SpawnInfo = Readonly<{
    tag: "SpawnInfo";
    snakeId: number;
    gameConfig: GameConfig;
}>;
