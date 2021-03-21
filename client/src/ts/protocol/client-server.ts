export type ClientToServerMessage = UpdatePlayerName;
export type ServerToClientJSONMessage = SpawnInfo;

export type UpdatePlayerName = {
    tag: "UpdatePlayerName";
    name: string;
};

export type SpawnInfo = {
    tag: "SpawnInfo";
    snakeId: number;
    gameConfig: GameConfig;
};

export type GameConfig = {
    snakeSpeed: number;
    fastSnakeSpeed: number;
    maxTurnDelta: number;
    tickDuration: number;
};
