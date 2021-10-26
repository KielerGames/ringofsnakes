export type GameConfig = Readonly<{
    chunks: Readonly<ChunkInfo>;
    snakes: Readonly<SnakeInfo>;

    tickDuration: number;
    foodNutritionalValue: number;
    foodConversionEfficiency: number;
    selfCollision: boolean;
}>;

type ChunkInfo = {
    size: number;
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
    maxWidth: number;
    burnRate: number;
    turnRateLimiting: number;
};
