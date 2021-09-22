export type GameConfig = Readonly<{
    snakeSpeed: number;
    fastSnakeSpeed: number;
    maxTurnDelta: number;
    tickDuration: number;
    minLength: number;
    chunkInfo: Readonly<{
        chunkSize: number;
        columns: number;
        rows: number;
    }>;
}>;
