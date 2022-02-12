import { FoodChunkDTO } from "./FoodChunkDTO";
import { LeaderboardDTO } from "./Leaderboard";
import { SnakeChunkDTO } from "./SnakeChunkDTO";
import { SnakeDTO } from "./SnakeDTO";

export type DataUpdateDTO = {
    ticksSinceLastUpdate: number;
    snakes: SnakeDTO[];
    snakeChunks: SnakeChunkDTO[];
    leaderboard?: LeaderboardDTO;
    snakeDeaths: SnakeId[];
    foodChunks: FoodChunkDTO[];
    moreUpdates: boolean;
};

type SnakeId = number;
