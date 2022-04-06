import { FoodChunkDTO } from "./FoodChunkDTO";
import { LeaderboardDTO } from "./Leaderboard";
import { SnakeChunkDTO } from "./SnakeChunkDTO";
import { SnakeDTO } from "./SnakeDTO";

export type DataUpdateDTO = {
    ticksSinceLastUpdate: number;
    moreUpdates: boolean;

    snakes: SnakeDTO[];
    snakeChunks: SnakeChunkDTO[];
    snakeDeaths: SnakeId[];
    foodChunks: FoodChunkDTO[];

    leaderboard?: LeaderboardDTO;
    heatMap?: Uint8Array;
};

type SnakeId = number;
