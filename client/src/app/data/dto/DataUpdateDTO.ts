import { FoodChunkDTO } from "./FoodChunkDTO";
import { GameStatisticsDTO } from "./GameStatisticsDTO";
import { SnakeChunkDTO } from "./SnakeChunkDTO";
import { SnakeDTO } from "./SnakeDTO";

export type DataUpdateDTO = {
    ticksSinceLastUpdate: number;
    moreUpdates: boolean;

    snakes: SnakeDTO[];
    snakeChunks: SnakeChunkDTO[];
    snakeDeaths: SnakeId[];
    foodChunks: FoodChunkDTO[];

    leaderboard?: GameStatisticsDTO;
    heatMap?: Uint8Array;
};

type SnakeId = number;
