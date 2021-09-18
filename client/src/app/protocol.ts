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

export type GameConfig = Readonly<{
    snakeSpeed: number;
    fastSnakeSpeed: number;
    maxTurnDelta: number;
    tickDuration: number;
    minLength: number;
    chunkInfo: {
        chunkSize: number;
        columns: number;
        rows: number;
    };
}>;
