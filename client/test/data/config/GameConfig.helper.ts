import { GameConfig } from "../../../src/app/data/config/GameConfig";

export const defaultConfig: GameConfig = {
    chunks: {
        size: 32.0,
        columns: 16,
        rows: 16
    },
    snakes: {
        speed: 0.24,
        fastSpeed: 2 * 0.24,
        maxTurnDelta: 0.05236,
        minLength: 6,
        startLength: 8,
        minWidth: 1.0,
        maxWidth: 8.0,
        burnRate: 1 / 10,
        turnRateLimiting: 0.85
    },

    tickDuration: 1.0 / 25.0,
    foodNutritionalValue: 1.0,
    foodConversionEfficiency: 0.5,
    selfCollision: false
};
