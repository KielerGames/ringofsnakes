import { DataUpdateDTO } from "../../../src/app/data/dto/DataUpdateDTO";

export const emptyDataUpdate: DataUpdateDTO = {
    ticksSinceLastUpdate: 0,
    snakes: [],
    snakeChunks: [],
    snakeDeaths: [],
    foodChunks: []
};
