import { DataUpdateDTO } from "../../../src/app/data/dto/DataUpdateDTO";
import { createSnakeChunkDTO } from "./SnakeChunkDTO.prefab";
import { createSnakeDTO } from "./SnakeDTO.prefab";

export const emptyDataUpdate: DataUpdateDTO = {
    ticksSinceLastUpdate: 0,
    snakes: [],
    snakeChunks: [],
    snakeDeaths: [],
    foodChunks: []
};

export function createSingleSnakeDataUpdate(
    snakeId: number,
    chunkId?: number,
    chunkOffset?: number
): DataUpdateDTO {
    const withChunk = chunkOffset !== undefined && chunkId !== undefined;
    return {
        ticksSinceLastUpdate: 1,
        snakes: [createSnakeDTO({ id: snakeId })],
        snakeChunks: withChunk
            ? [
                  createSnakeChunkDTO({
                      id: 1,
                      snakeId,
                      offset: chunkOffset
                  })
              ]
            : [],
        snakeDeaths: [],
        foodChunks: []
    };
}
