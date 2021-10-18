export type GameConfig = Readonly<{
    snakeSpeed: number;
    snakeStartLength: number;
    snakeMinWidth: number;
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
