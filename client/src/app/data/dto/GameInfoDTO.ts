import { GameConfig } from "../config/GameConfig";

export type GameInfoDTO = {
    readonly config: GameConfig;
    readonly targetSnakeId: number;
    readonly startPosition: {
        x: number;
        y: number;
    };
    readonly recording: boolean;
};
