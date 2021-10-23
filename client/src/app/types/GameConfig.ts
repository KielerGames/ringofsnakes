export type GameConfig = Readonly<{
    chunks: Readonly<ChunkInfo>;
    snakes: Readonly<SnakeInfo>;

    tickDuration: number;
    foodNutritionalValue: number;
    foodConversionEfficiency: number;
}>;

type ChunkInfo = {
    chunkSize: number;
    columns: number;
    rows: number;
};

type SnakeInfo = {
    speed: number;
    fastSpeed: number;
    maxTurnDelta: number;
    minLength: number;
    startLength: number;
    minWidth: number;
    burnRate: number;
};
