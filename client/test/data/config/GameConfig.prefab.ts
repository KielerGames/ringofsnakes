import { GameConfig } from "../../../src/app/data/config/GameConfig";

const defaultConfig: GameConfig = {
    chunks: {
        size: 32.0,
        columns: 8,
        rows: 8
    },
    snakes: {
        speed: 1,
        fastSpeed: 2,
        maxTurnDelta: 0.05236,
        minLength: 6,
        startLength: 8,
        minWidth: 1.0,
        maxWidth: 8.0,
        burnRate: 1 / 10,
        turnRateLimiting: 0.85
    },

    tickDuration: 1.0,
    foodNutritionalValue: 1.0,
    foodConversionEfficiency: 0.5,
    selfCollision: false
};

export default defaultConfig;

export const zeroSpeedConfig: GameConfig = {
    chunks: {
        size: 32.0,
        columns: 8,
        rows: 8
    },
    snakes: {
        speed: 0,
        fastSpeed: 0,
        maxTurnDelta: 0.01,
        minLength: 1,
        startLength: 8,
        minWidth: 1.0,
        maxWidth: 8.0,
        burnRate: 1 / 10,
        turnRateLimiting: 0.85
    },

    tickDuration: 1.0,
    foodNutritionalValue: 1.0,
    foodConversionEfficiency: 0.5,
    selfCollision: false
};
